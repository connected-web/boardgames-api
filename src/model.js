const gsjson = require('google-spreadsheet-to-json')
const { fetch } = require('promise-path')
const readJson = require('./util/readJson')
const writeJson = require('./util/writeJson')

function defaultBoardGameGeekCollection () {
  return { items: [{ item: [] }] }
}

const model = {
  fetchers: {
    gsjson,
    fetch
  },
  readers: {
    readJson
  },
  writers: {
    writeJson
  },
  boardGameGeek: {
    collection: defaultBoardGameGeekCollection(),
    index: {}
  },
  calisaurus: {
    index: {},
    feed: [],
    playstats: []
  },
  games: {},
  defaultBoardGameGeekCollection
}

module.exports = model
