const { position, read } = require('promise-path')
const writeFile = require('./util/writeFile')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Feed]', ...messages)

async function readJson (path) {
  const body = await read(path, 'utf8')
  return JSON.parse(body)
}

const mutateRemoveEmpty = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      mutateRemoveEmpty(obj[key])
    } else if (obj[key] == null) {
      delete obj[key]
    }
  })
}

async function start () {
  report('Requires', 'data/boardgame-index.json')

  const boardGameIndex = await readJson(datapath('boardgame-index.json'))
  let feed = []

  Object.keys(boardGameIndex).forEach(boardGameApiId => {
    const entry = boardGameIndex[boardGameApiId]
    entry.playRecords = entry.playRecords || []
    entry.playRecords.forEach((record, pos, dates) => {
      const feedItem = {
        date: record.date,
        name: entry.name,
        winner: record.winner,
        coOp: record.coOp,
        coOpOutcome: record.coOpOutcome,
        note: record.notes
      }
      feed.push(feedItem)
    })
  })

  mutateRemoveEmpty(feed)

  feed = feed.sort((a, b) => {
    const da = (new Date(a.date)).getTime()
    const db = (new Date(b.date)).getTime()
    return da > db ? 1 : -1
  })

  return writeFile('Board Game Feed', 'boardgame-feed.json', { feed })
}

module.exports = start
