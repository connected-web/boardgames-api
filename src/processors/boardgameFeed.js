const log = []
const sortByFeedPriority = require('../util/sortByFeedPriority')
const report = (...messages) => log.push(['[Create Board Game Feed]', ...messages].join(' '))

const mutateRemoveEmpty = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      mutateRemoveEmpty(obj[key])
    } else if (obj[key] == null) {
      delete obj[key]
    }
  })
}

async function createFeed (model) {
  const boardGameIndex = model.calisaurus.index
  let feed = []

  report(`Create feed from ${Object.keys(boardGameIndex).length} items`)
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
        note: record.notes ? record.notes + '' : record.notes
      }
      feed.push(feedItem)
    })
  })

  mutateRemoveEmpty(feed)

  model.calisaurus.feed = feed.sort(sortByFeedPriority)
  return { feed: model.calisaurus.feed, log }
}

function init (model) {
  return () => createFeed(model)
}

module.exports = init
