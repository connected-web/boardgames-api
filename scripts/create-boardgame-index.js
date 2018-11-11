const { position } = require('promise-path')
const pluralise = require('./util/pluralise')
const writeFile = require('./util/writeFile')
const convertGSheetsDate = require('./util/convertGSheetsDate')
const reduceNameToBoardGameApiId = require('./util/reduceNameToBoardGameApiId')
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
    const boardGameApiId = reduceNameToBoardGameApiId(name)
    accumulator[boardGameApiId] = {
      boardGameGeekGameId: id,
      boardGameGeekName: name,
      boardGameApiId: boardGameApiId,
      game: name
    }
    return accumulator
  }

  function mapCaliPlayStatGame (accumulator, item) {
    const name = item.game
    const boardGameApiId = reduceNameToBoardGameApiId(name)
    const entry = accumulator[boardGameApiId] || {boardGameApiId}
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
      } else if (entry[key] && entry[key] !== value) {
        entry[`${key}_conflict`] = value
      } else {
        entry[key] = value
      }
    })
    accumulator[boardGameApiId] = entry
    return accumulator
  }

  const boardGameApiIds = Object.entries(boardGameIndex).map(kvp => kvp[1].boardGameApiId).sort()

  await writeFile('Board Game API IDs', 'boardgame-api-ids.json', {boardGameApiIds}, report)

  await Promise.all(Object.entries(boardGameIndex).map(kvp => {
    const boardGameApiId = kvp[0]
    const entry = kvp[1]
    return writeFile(entry.game, `index/${boardGameApiId}.json`, entry)
  }))

  return writeFile('Board Game Index', 'boardgame-index.json', boardGameIndex)
}

module.exports = start
