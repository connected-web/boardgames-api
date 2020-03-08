const gsjson = require('google-spreadsheet-to-json')
const { fetch } = require('promise-path')

function defaultBoardGameGeekCollection () {
  return { items: [{ item: [] }] }
}

const model = {
  fetchers: {
    gsjson,
    fetch
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
