const { write } = require('promise-path')
const position = require('./helpers/position')(__dirname, '../data')

async function start () {
  console.log('[Create Board Game Geek Index]', 'Requires data/bgg-collection.json')

  const collection = require(position('bgg-collection.json'))
  const boardGameIndex = collection.items[0].item.reduce(mapBoardGame, {})

  function mapBoardGame (accumulator, item) {
    const name = item.name[0]._text[0]
    const id = item._attributes.objectid
    accumulator[name] = {
      boardGameGeekGameId: id
    }
    return accumulator
  }

  console.log('[Create Board Game Geek Index]', boardGameIndex)
  return write(position('bgg-index.json'), JSON.stringify(boardGameIndex, null, 2), 'utf8')
}

module.exports = start
