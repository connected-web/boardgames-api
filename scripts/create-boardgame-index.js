const { position, clean } = require('promise-path')
const writeFile = require('./util/writeFile')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Index]', ...messages)
const { model, boardgameIndex } = require('../')

async function start () {
  report('Requires data/bgg-collection.json')
  report('Requires data/cali-playstats.json')

  const { calisaurus } = model
  calisaurus.collection = require(datapath('bgg-collection.json'))
  calisaurus.playstats = require(datapath('cali-playstats.json'))
  const { index } = await boardgameIndex()

  const boardGameApiIds = Object.entries(index).map(([, entry]) => entry.boardGameApiId).sort()

  report('Cleaning out the /data/index/ path')
  await clean(datapath('/index'))
  await writeFile('Board Game API IDs', 'boardgame-api-ids.json', {boardGameApiIds}, report)

  const entries = Object.entries(calisaurus.index)
  await Promise.all(entries.map(async ([boardGameApiId, entry]) => {
    return writeFile(entry.name, `index/${boardGameApiId}.json`, entry)
  }))

  return writeFile('Board Game Index', 'boardgame-index.json', index)
}

module.exports = start
