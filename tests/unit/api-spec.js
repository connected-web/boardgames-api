const { expect } = require('chai')
const api = require('../../')
const model = require('../../src/model')

describe('Boardgames API', () => {
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
        'boardgameSummaries',
        'uniqueListOfPlayedGames'
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
        'coOp': 'Yes',
        'coOpOutcome': 'Won',
        'date': 43101,
        'game': 'Harry Potter: Hogwarts Battle',
        'notes': 'Game 1',
        'tag': 'Deckbuilder'
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
      const expectedXMLtoJSON = { item: [{
        '_attributes': {
          'some': 'Game Data'
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
      model.boardGameGeek.collection = { items: [{ item: [
        {
          name: [{ _text: ['Love Letter'] }],
          _attributes: { objectid: '51253142' }
        }
      ]}] }
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
})
