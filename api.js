const model = require('./src/model')

const downloadBggCollection = require('./src/fetchers/downloadBggCollection')(model)
const downloadBggEntries = require('./src/fetchers/downloadBggEntries')(model)
const downloadCaliGameIndex = require('./src/fetchers/downloadCaliGameIndex')(model)
const downloadCaliPlaystats = require('./src/fetchers/downloadCaliPlaystats')(model)

const bggIndex = require('./src/processors/bggIndex')(model)
const boardgameList = require('./src/processors/boardgameList')(model)
const boardgameFeed = require('./src/processors/boardgameFeed')(model)
const boardgameIndex = require('./src/processors/boardgameIndex')(model)
const boardgameSummaries = require('./src/processors/boardgameSummaries')(model)
const uniqueListOfPlayedGames = require('./src/processors/uniqueListOfPlayedGames')(model)

const api = {
  downloadBggCollection,
  downloadBggEntries,
  downloadCaliGameIndex,
  downloadCaliPlaystats,
  bggIndex,
  boardgameList,
  boardgameIndex,
  boardgameFeed,
  boardgameSummaries,
  uniqueListOfPlayedGames
}

module.exports = api
