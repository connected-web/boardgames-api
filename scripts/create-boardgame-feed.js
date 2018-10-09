const { write, position } = require('promise-path')
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

  Object.keys(boardGameIndex).forEach(game => {
    const entry = boardGameIndex[game]
    entry.dates = entry.dates || []
    entry.dates.forEach((date, pos, dates) => {
      const feedItem = {
        date,
        game,
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

  const filename = 'boardgame-feed.json'
  report('Writing Feed:', feed, 'to', filename)

  return write(datapath(filename), JSON.stringify({ feed }, null, 2), 'utf8')
}

module.exports = start
