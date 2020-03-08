const gsjson = require('google-spreadsheet-to-json')
const { fetch, position, read, write } = require('promise-path')
const readJson = require('./util/readJson')
const writeJson = require('./util/writeJson')
const datapath = position(__dirname, '../../data')

function defaultBoardGameGeekCollection () {
  return { items: [{ item: [] }] }
}

const model = {
  fetchers: {
    gsjson,
    fetch
  },
  positions: {
    datapath
  },
  readers: {
    read,
    readJson
  },
  writers: {
    write,
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
