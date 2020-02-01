const { expect } = require('chai')
const api = require('../../')

describe('Boardgames API', () => {
  it('should return an object with expected properties', () => {
    const actual = Object.keys(api)
    const expected = [
      'downloadBggCollection',
      'downloadBggEntries',
      'downloadBggCaliGameIndex',
      'downloadBggCaliPlaystats',
      'bggIndex',
      'boardgameList',
      'boardgameIndex',
      'boardgameFeed',
      'boardgameSummaries',
      'uniqueListOfPlayedGames'
    ]
    expect(actual).to.deep.equal(expected)
  })
})
