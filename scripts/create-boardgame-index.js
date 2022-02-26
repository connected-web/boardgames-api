const { clean } = require('promise-path')
const report = (...messages) => console.log('[Create Board Game Index]', ...messages)
const { model, boardgameIndex } = require('../')

async function start () {
  report('Requires data/bgg-collection.json')
  report('Requires data/cali-playstats.json')
  report('Requires data/cali-playrecords.json')

  const { calisaurus, positions, readers, writers } = await model()
  const { datapath } = positions
  const { readJson } = readers
  const { writeJson } = writers

  calisaurus.collection = await readJson('bgg-collection.json')
  calisaurus.playstats = await readJson('cali-playstats.json')
  calisaurus.playrecords = await readJson('cali-playrecords.json')
  const { index } = await boardgameIndex()

  const boardGameApiIds = Object.entries(index).map(([, entry]) => entry.boardGameApiId).sort()

  report('Cleaning out the /data/index/ path')
  await clean(datapath('/index'))
  await writeJson('Board Game API IDs', 'boardgame-api-ids.json', { boardGameApiIds }, report)

  const entries = Object.entries(calisaurus.index)
  await Promise.all(entries.map(async ([boardGameApiId, entry]) => {
    return writeJson(entry.name, `index/${boardGameApiId}.json`, entry)
  }))

  return writeJson('Board Game Index', 'boardgame-index.json', index)
}

module.exports = start
