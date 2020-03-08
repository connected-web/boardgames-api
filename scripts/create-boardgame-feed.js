const { position, read } = require('promise-path')
const writeFile = require('./util/writeFile')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Feed]', ...messages)
const { model, boardgameFeed } = require('../')

async function readJson (path) {
  const body = await read(path, 'utf8')
  return JSON.parse(body)
}

async function start () {
  const { calisaurus } = await model()
  report('Requires', 'data/boardgame-index.json')

  calisaurus.index = await readJson(datapath('boardgame-index.json'))
  const { feed } = await boardgameFeed()

  return writeFile('Board Game Feed', 'boardgame-feed.json', { feed })
}

module.exports = start
