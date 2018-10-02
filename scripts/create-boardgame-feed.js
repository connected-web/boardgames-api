const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')

async function start () {
  console.log('[Create Board Game Feed]', 'Requires data/boardgame-index.json')

  const boardGameIndex = require(datapath('boardgame-index.json'))
  let feed = []

  Object.keys(boardGameIndex).forEach(game => {
    const entry = boardGameIndex[game]
    entry.dates = entry.dates || []
    console.log('?', game, entry)
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

  feed = feed.sort((a, b) => {
    const da = (new Date(a)).getTime()
    const db = (new Date(b)).getTime()
    return da > db ? 1 : -1
  })

  console.log('[Create Board Game Feed]', feed)

  return write(datapath('boardgame-feed.json'), JSON.stringify({ feed }, null, 2), 'utf8')
}

module.exports = start
