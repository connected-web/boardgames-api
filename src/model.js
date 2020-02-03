const gsjson = require('google-spreadsheet-to-json')
const { fetch } = require('promise-path')

const model = {
  fetchers: {
    gsjson,
    fetch
  },
  boardGameGeek: {
    collection: { items: [{ item: [] }] },
    index: {}
  },
  calisaurus: {
    index: {}
  }
}

module.exports = model
