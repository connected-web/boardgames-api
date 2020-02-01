const model = require('./src/model')

const downloadBggCollection = require('./src/fetchers/downloadBggCollection')
const downloadBggEntries = require('./src/fetchers/downloadBggEntries')
const downloadBggCaliGameIndex = require('./src/fetchers/downloadCaliGameIndex')
const downloadBggCaliPlaystats = require('./src/fetchers/downloadCaliPlaystats')

const bggIndex = require('./src/processors/bggIndex')(model)
const boardgameList = require('./src/processors/boardgameList')(model)
const boardgameFeed = require('./src/processors/boardgameFeed')(model)
const boardgameIndex = require('./src/processors/boardgameIndex')(model)
const boardgameSummaries = require('./src/processors/boardgameSummaries')(model)
const uniqueListOfPlayedGames = require('./src/processors/uniqueListOfPlayedGames')(model)

const api = {
  downloadBggCollection,
  downloadBggEntries,
  downloadBggCaliGameIndex,
  downloadBggCaliPlaystats,
  bggIndex,
  boardgameList,
  boardgameIndex,
  boardgameFeed,
  boardgameSummaries,
  uniqueListOfPlayedGames
}

module.exports = api
