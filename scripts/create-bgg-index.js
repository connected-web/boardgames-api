const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Geek Index]', ...messages)

async function start () {
  report('Requires', 'data/bgg-collection.json')

  const collection = require(datapath('bgg-collection.json'))
  const boardGameGeekIndex = collection.items[0].item.reduce(mapBoardGame, {})

  function mapBoardGame (accumulator, item) {
    const name = item.name[0]._text[0]
    const id = item._attributes.objectid
    accumulator[name] = {
      boardGameGeekGameId: id
    }
    return accumulator
  }

  report('Index', boardGameGeekIndex)
  return write(datapath('bgg-index.json'), JSON.stringify(boardGameGeekIndex, null, 2), 'utf8')
}

module.exports = start
