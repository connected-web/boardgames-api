const report = (...messages) => console.log('[Create Board Game Challenge Grids]', ...messages)
const { model, boardgameChallengeGrids } = require('../')

async function start () {
  const { calisaurus, readers, writers } = await model()
  const { readJson } = readers
  const { writeJson } = writers

  report('Requires', 'data/boardgame-index.json')
  report('Requires', 'data/boardgame-feed.json')

  calisaurus.index = await readJson('boardgame-index.json')
  calisaurus.feed = (await readJson('boardgame-feed.json')).feed
  const { byYear, log } = await boardgameChallengeGrids()

  report('Logs:', log.length)
  log.forEach(line => console.log(line))

  const filesToWrite = Object.entries(byYear).map(async ([year, grid]) => {
    return writeJson(`Board Game Challenge Grid for ${year}`, `challenge-grids/challenge-grid-${year}.json`, grid)
  })

  return Promise.all(filesToWrite)
}

module.exports = start
