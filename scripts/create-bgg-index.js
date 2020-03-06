const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Geek Index]', ...messages)
const { model, bggIndex } = require('../')

async function start () {
  const { boardGameGeek } = await model()
  report('Requires', 'data/bgg-collection.json')
  boardGameGeek.collection = require(datapath('bgg-collection.json'))
  const { index } = await bggIndex()

  report('Index', index)
  return write(datapath('bgg-index.json'), JSON.stringify(index, null, 2), 'utf8')
}

module.exports = start
