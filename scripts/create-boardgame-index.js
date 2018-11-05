const { write, position } = require('promise-path')
const pluralise = require('./util/pluralise')
const convertGSheetsDate = require('./util/convertGSheetsDate')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Index]', ...messages)

const expectedProperties = ['date', 'game', 'winner', 'coOpOutcome', 'coOp', 'notes', 'mechanics']

async function start () {
  report('Requires data/bgg-collection.json')
  report('Requires data/cali-playstats.json')

  const collection = require(datapath('bgg-collection.json'))
  const caliPlayStats = require(datapath('cali-playstats.json'))

  const boardGameIndex = {}
  collection.items[0].item.reduce(mapBoardGameGeekGame, boardGameIndex)
  caliPlayStats.reduce(mapCaliPlayStatGame, boardGameIndex)

  function mapBoardGameGeekGame (accumulator, item) {
    const name = item.name[0]._text[0]
    const id = item._attributes.objectid
    accumulator[name] = {
      boardGameGeekGameId: id,
      boardGameGeekName: name,
      game: name
    }
    return accumulator
  }

  function mapCaliPlayStatGame (accumulator, item) {
    const name = item.game
    const entry = accumulator[name] || {}
    expectedProperties.forEach(key => {
      const keyplural = pluralise(key)
      let value = item[key]
      if (key.toLowerCase().includes('date')) {
        value = convertGSheetsDate(value)
      }

      if (keyplural) {
        const values = entry[keyplural] || []
        values.push(value)
        entry[keyplural] = values
      }
      else if(entry[key] && entry[key] !== value) {
        entry[`${key}_conflict`] = value
      }
      else {
        entry[key] = value
      }
    })
    accumulator[name] = entry
    return accumulator
  }

  const filename = 'boardgame-index.json'
  report('Writing Board Game Index', boardGameIndex, 'to', filename)

  return write(datapath(filename), JSON.stringify(boardGameIndex, null, 2), 'utf8')
}

module.exports = start
