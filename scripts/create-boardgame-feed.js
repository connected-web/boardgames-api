const { position } = require('promise-path')
const writeFile = require('./util/writeFile')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Feed]', ...messages)

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

  const boardGameIndex = require(datapath('boardgame-index.json'))
  let feed = []

  Object.keys(boardGameIndex).forEach(boardGameApiId => {
    const entry = boardGameIndex[boardGameApiId]
    entry.dates = entry.dates || []
    entry.dates.forEach((date, pos, dates) => {
      const feedItem = {
        date,
        game: entry.game,
        winner: entry.winners && entry.winners[pos],
        coOp: entry.coOpTypes && entry.coOpTypes[pos],
        coOpOutcome: entry.coOpOutcomes && entry.coOpOutcomes[pos],
        note: entry.notes && entry.notes[pos]
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
