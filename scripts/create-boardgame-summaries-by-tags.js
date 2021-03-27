const { clean } = require('promise-path')
const report = (...messages) => console.log('[Create Board Game Index]', ...messages)
const { model, boardgameSummariesByTags } = require('../api')

async function start () {
  report('Requires data/boardgame-index.json')

  const { calisaurus, positions, readers, writers } = await model()
  const { datapath } = positions
  const { readJson } = readers
  const { writeJson } = writers

  calisaurus.index = await readJson('boardgame-index.json')
  const { log, summariesByTags } = await boardgameSummariesByTags()

  log.forEach(record => console.log(record))

  const boardGameTags = Object.entries(summariesByTags).reduce((acc, [tag, entry]) => {
    acc[tag] = Object.keys(entry)
    return acc
  }, {})

  report('Cleaning out the /data/tags/ path')
  await clean(datapath('/tags'))
  await writeJson('Board Game Tags Summary', 'boardgame-tags-summary.json', { boardGameTags }, report)

  const entries = Object.entries(summariesByTags)
  await Promise.all(entries.map(async ([tagName, entry]) => {
    const values = Object.entries(entry)
    return Promise.all(values.map(async ([tagValue, summary]) => {
      return writeJson(summary.name, `tags/${tagName}/${tagValue}.json`, summary)
    }))
  }))

  return writeJson('Board Game Index', 'boardgame-summaries-by-tag.json', summariesByTags)
}

module.exports = start
