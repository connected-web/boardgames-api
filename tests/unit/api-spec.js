const { expect } = require('chai')
const api = require('../../')

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
      const { playstats } = await api.downloadCaliPlaystats()
      const firstGameInJanuary = {
        'coOp': 'Yes',
        'coOpOutcome': 'Won',
        'date': 43101,
        'game': 'Harry Potter: Hogwarts Battle',
        'notes': 'Game 1',
        'tag': 'Deckbuilder'
      }
      expect(playstats[0]).to.deep.equal(firstGameInJanuary)
    }).timeout(5000)
  })
})
