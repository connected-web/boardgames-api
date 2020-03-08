const report = (...messages) => console.log('[Create Board Game Feed]', ...messages)
const { model, boardgameFeed } = require('../')

async function start () {
  const { calisaurus, readers, writers } = await model()
  const { readJson } = readers
  const { writeJson } = writers

  report('Requires', 'data/boardgame-index.json')

  calisaurus.index = await readJson('boardgame-index.json')
  const { feed } = await boardgameFeed()

  return writeJson('Board Game Feed', 'boardgame-feed.json', { feed })
}

module.exports = start
