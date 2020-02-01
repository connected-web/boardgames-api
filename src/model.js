const gsjson = require('google-spreadsheet-to-json')
const { fetch } = require('promise-path')

const model = {
  fetchers: {
    gsjson,
    fetch
  },
  boardGameGeek: {},
  calisaurus: {}
}

module.exports = model
