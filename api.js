const model = require('./src/model')

const downloadBggCollection = require('./src/fetchers/downloadBggCollection')(model)
const downloadBggEntries = require('./src/fetchers/downloadBggEntries')(model)
const downloadCaliGameIndex = require('./src/fetchers/downloadCaliGameIndex')(model)
const downloadCaliPlaystats = require('./src/fetchers/downloadCaliPlaystats')(model)
const downloadCaliPlayrecords = require('./src/fetchers/downloadCaliPlayrecords')(model)

const bggIndex = require('./src/processors/bggIndex')(model)
const boardgameList = require('./src/processors/boardgameList')(model)
const boardgameFeed = require('./src/processors/boardgameFeed')(model)
const boardgameChallengeGrids = require('./src/processors/boardgameChallengeGrids')(model)
const boardgameIndex = require('./src/processors/boardgameIndex')(model)
const boardgameSummaries = require('./src/processors/boardgameSummaries')(model)
const boardgameSummariesByTags = require('./src/processors/boardgameSummariesByTags')(model)
const uniqueListOfGamesPlayed = require('./src/processors/uniqueListOfGamesPlayed')(model)

const api = {
  downloadBggCollection,
  downloadBggEntries,
  downloadCaliGameIndex,
  downloadCaliPlaystats,
  downloadCaliPlayrecords,
  bggIndex,
  boardgameList,
  boardgameIndex,
  boardgameFeed,
  boardgameChallengeGrids,
  boardgameSummaries,
  boardgameSummariesByTags,
  uniqueListOfGamesPlayed,
  model: async () => model
}

module.exports = api
