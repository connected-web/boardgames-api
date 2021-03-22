const { expect } = require('chai')
const { validate } = require('jsonschema')
const api = require('../../')
const model = require('../../src/model')

const boardGameStatsSchema = require('../../api/handlers/boardgame-stats/schema.json')
const boardGameStatsByMonthSchema = require('../../api/handlers/boardgame-stats-byMonth/schema.json')
const boardGameStatsByYearSchema = require('../../api/handlers/boardgame-stats-byYear/schema.json')

describe('Boardgames API', () => {
  beforeEach(() => {
    model.calisaurus.feed = []
    model.calisaurus.index = {}
    model.calisaurus.playstats = []
    model.boardGameGeek.collection = model.defaultBoardGameGeekCollection()
  })

  describe('Basic properties', () => {
    it('should return an object with expected properties', () => {
      const actual = Object.keys(api)
      const expected = [
        'downloadBggCollection',
        'downloadBggEntries',
        'downloadCaliGameIndex',
        'downloadCaliPlaystats',
        'bggIndex',
        'boardgameList',
        'boardgameIndex',
        'boardgameFeed',
        'boardgameChallengeGrids',
        'boardgameSummaries',
        'boardgameSummariesByTags',
        'uniqueListOfGamesPlayed',
        'model'
      ]
      expect(actual).to.deep.equal(expected)
    })

    const functions = Object.keys(api)
    functions.forEach((key) => {
      it(`api.${key} should be a function`, () => {
        expect(typeof api[key]).to.equal('function')
      })
    })
  })

  describe('Download Cali Playstats', () => {
    it('should return a list of playstats from gsheets', async () => {
      const firstGameInJanuary = {
        coOp: 'Yes',
        coOpOutcome: 'Won',
        date: 43101,
        game: 'Harry Potter: Hogwarts Battle',
        notes: 'Game 1',
        tag: 'Deckbuilder'
      }
      model.fetchers.gsjson = () => {
        return [firstGameInJanuary]
      }
      const { playstats } = await api.downloadCaliPlaystats()
      expect(playstats[0]).to.deep.equal(firstGameInJanuary)
    })
  })

  describe('Download Cali Game Index', () => {
    it('should return the game index from gsheets', async () => {
      const firstGameInList = {
        boardGameName: '221B Baker Street: The Master Detective Game',
        purchaseDate: 2017
      }
      model.fetchers.gsjson = () => {
        return [firstGameInList]
      }
      const { gameIndex } = await api.downloadCaliGameIndex()
      expect(gameIndex[0]).to.deep.equal(firstGameInList)
    })
  })

  describe('Download Board Game Geek Entries', () => {
    it('should return a warning by default', async () => {
      const { warning } = await api.downloadBggEntries()
      expect(warning).to.include('node run download-bgg-entries')
    })
  })

  describe('Download Board Game Geek Collection', () => {
    it('should return all the games entered in board game geek under our account', async () => {
      const expectedXMLtoJSON = {
        item: [{
          _attributes: {
            some: 'Game Data'
          }
        }]
      }
      model.fetchers.fetch = () => {
        return `
          <?xml version="1.0" encoding="UTF-8"?>
          <item some='Game Data' />
        `
      }
      const { collection } = await api.downloadBggCollection()
      expect(collection).to.deep.equal(expectedXMLtoJSON)
    })
  })

  describe('Create Board Game Geek Index', () => {
    it('should reduce the board game geek collection into an index', async () => {
      model.boardGameGeek.collection = {
        items: [{
          item: [
            {
              name: [{ _text: ['Love Letter'] }],
              _attributes: { objectid: '51253142' }
            }
          ]
        }]
      }
      const actual = await api.bggIndex()
      expect(actual.index).to.deep.equal({
        'Love Letter': { boardGameGeekGameId: '51253142' }
      })
    })
  })

  describe('Create Board Game Feed', () => {
    it('should map game entries into a date sorted feed', async () => {
      const now = new Date()
      model.calisaurus.index = {
        'love-letter': {
          name: 'Love Letter',
          playRecords: [{
            date: now,
            winner: 'John',
            coOp: false,
            coOpOutcome: undefined,
            notes: ''
          }]
        }
      }
      const actual = await api.boardgameFeed()
      expect(actual.feed).to.deep.equal([{
        date: now,
        name: 'Love Letter',
        winner: 'John',
        coOp: false,
        note: ''
      }])
    })
  })

  describe('Create Board Game Index', () => {
    it('should build an empty board game index from no data', async () => {
      const actual = await api.boardgameIndex()
      const expected = {}
      expect(actual.index).to.deep.equal(expected)
    })

    it('should build a board game index out of all available information', async () => {
      const examplePlaystat = {
        coOp: 'Yes',
        coOpOutcome: 'Won',
        date: 43101,
        game: 'Harry Potter: Hogwarts Battle',
        notes: 'Game 1',
        tag: 'Deckbuilder'
      }
      model.calisaurus.playstats = [examplePlaystat, examplePlaystat, examplePlaystat]
      const actual = await api.boardgameIndex()
      const expected = {
        'harry-potter-hogwarts-battle': {
          boardGameApiId: 'harry-potter-hogwarts-battle',
          playRecords: [
            {
              date: '2018-01-01',
              coOpOutcome: 'Won',
              coOp: 'Yes',
              notes: 'Game 1'
            },
            {
              date: '2018-01-01',
              coOpOutcome: 'Won',
              coOp: 'Yes',
              notes: 'Game 1'
            },
            {
              date: '2018-01-01',
              coOpOutcome: 'Won',
              coOp: 'Yes',
              notes: 'Game 1'
            }
          ],
          name: 'Harry Potter: Hogwarts Battle',
          totalGamesPlayed: 3,
          coOpGamesPlayedCount: 3,
          coOpGamesPlayedPercentage: 1,
          coOpGameWins: 3,
          coOpGameLoses: 0,
          coOpWinRate: 1,
          coOpLossRate: 0,
          winCountHannah: 0,
          winCountJohn: 0,
          winCountOther: 0,
          winCountDraw: 0,
          winnableGamesTotal: 0,
          winPercentageHannah: 0,
          winPercentageJohn: 0,
          winPercentageOther: 0,
          winPercentageDraw: 0,
          mostWonGames: 'Draw'
        }
      }
      expect(actual.index).to.deep.equal(expected)
    })
  })

  describe('Create Board Game Lists', () => {
    let actual
    before(async () => {
      const now = new Date()
      model.calisaurus.index = {
        'love-letter': {
          name: 'Love Letter',
          playRecords: [{
            date: now,
            winner: 'John',
            coOp: false,
            coOpOutcome: undefined,
            notes: ''
          }]
        }
      }
      const examplePlaystat = {
        winner: 'John',
        date: 43101,
        game: 'Love Letter'
      }
      model.calisaurus.playstats = [examplePlaystat]
      model.boardGameGeek.collection = model.defaultBoardGameGeekCollection()
      actual = await api.boardgameList()
    })

    it('should create a list of board games grouped by source', async () => {
      expect(actual.boardgameGroups).to.deep.equal({
        bggOnly: [],
        boardGameGeek: [],
        cali: ['Love Letter'],
        caliOnly: ['Love Letter'],
        overlap: [],
        stats: {
          'Board Game Geek only games': 0,
          'Cali only games': 1,
          'Number of Board Game Geek board games': 0,
          'Number of Cali board games': 1,
          'Overlap size between lists': 0
        }
      })
    })

    it('should create a sorted list of board game names', async () => {
      expect(actual.boardgameNames).to.deep.equal(['Love Letter'])
    })

    it('should create a list of board games mapping name to id', async () => {
      expect(actual.boardgameList).to.deep.equal([{
        name: 'Love Letter',
        boardGameApiId: 'love-letter'
      }])
    })
  })

  describe('Create Unique List of Games Played', () => {
    it('should create a list of unique games played, and other stats', async () => {
      model.calisaurus.feed = [{
        date: '2020-02-02',
        name: 'Love Letter',
        winner: 'John',
        coOp: false,
        note: ''
      }, {
        date: '2018-04-05',
        name: 'Love Letter',
        winner: 'Hannah',
        coOp: false,
        note: ''
      }]
      const actual = await api.uniqueListOfGamesPlayed()
      expect(actual).to.deep.equal({
        earliestDate: '2018-04-05',
        latestDate: '2020-02-02',
        uniqueGames: ['Love Letter'],
        uniqueGamesCount: 1,
        log: [
          '[Create Unique List of Played Games] Unique games count: 1 Earliest date 2018-04-05 Latest Date 2020-02-02'
        ]
      })
    })
  })

  describe('Create a list of Board Game Summaries', () => {
    let actual =
    before(async () => {
      model.calisaurus.feed = [{
        date: '2020-02-02',
        name: 'Love Letter',
        winner: 'John',
        coOp: false,
        note: ''
      }, {
        date: '2018-04-05',
        name: 'Love Letter',
        winner: 'Hannah',
        coOp: false,
        note: ''
      }]
      actual = await api.boardgameSummaries()
    })

    it('should create a set of boardgame summaries', async () => {
      expect(typeof actual.summaries).to.equal('object')
      expect(Array.isArray(actual.monthsInUse)).to.equal(true)
      expect(Array.isArray(actual.yearsInUse)).to.equal(true)
      expect(typeof actual.byAllTime).to.equal('object')
    })

    it('should summarise the feed by the first month in sequence', () => {
      const schemaValidation = validate(actual.monthsInUse[0], boardGameStatsByMonthSchema)
      expect(schemaValidation.errors, 'Schema validation errors for first month').to.deep.equal([])
    })

    it('should summarise the feed by the last month in sequence', () => {
      const schemaValidation = validate(actual.monthsInUse[1], boardGameStatsByMonthSchema)
      expect(schemaValidation.errors, 'Schema validation errors for last month').to.deep.equal([])
    })

    it('should summarise the feed by the first year in sequence', () => {
      const schemaValidation = validate(actual.yearsInUse[0], boardGameStatsByYearSchema)
      expect(schemaValidation.errors, 'Schema validation errors for first year').to.deep.equal([])
    })

    it('should summarise the feed by the last year in sequence', () => {
      const schemaValidation = validate(actual.yearsInUse[1], boardGameStatsByYearSchema)
      expect(schemaValidation.errors, 'Schema validation errors for last year').to.deep.equal([])
    })

    it('should summarise the feed by all time', () => {
      const schemaValidation = validate({
        byMonth: actual.byMonth,
        byYear: actual.byYear
      }, boardGameStatsSchema)
      expect(schemaValidation.errors, 'Schema validation errors for all time feed').to.deep.equal([])
    })
  })
})
