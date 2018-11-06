const { position } = require('promise-path')
const pluralise = require('./util/pluralise')
const writeFile = require('./util/writeFile')
const convertGSheetsDate = require('./util/convertGSheetsDate')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Index]', ...messages)

const expectedProperties = ['date', 'game', 'winner', 'coOpOutcome', 'coOp', 'notes', 'mechanics']

function reduceNameToBoardGameApiId(name) {
  return name.toLowerCase().replace(/[.]/g, '').replace(/[^a-z\d\-]/g, ' ').trim().replace(/(\s)+/g, '-')
}

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
      game: name,
      boardGameApiId: reduceNameToBoardGameApiId(name)
    }
    return accumulator
  }

  function mapCaliPlayStatGame (accumulator, item) {
    const name = item.game
    const boardGameApiId = reduceNameToBoardGameApiId(name)
    const entry = accumulator[name] || {boardGameApiId}
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

  const boardGameApiIds = Object.entries(boardGameIndex).map(kvp => kvp[1].boardGameApiId).sort()

  await writeFile('Board Game API IDs', 'boardgame-api-ids.json', {boardGameApiIds}, report)
  return writeFile('Board Game Index', 'boardgame-index.json', boardGameIndex, report)
}

module.exports = start
