const log = []
const report = (...messages) => log.push(['[Create Unique List of Played Games]', ...messages].join(' '))

async function createList (model) {
  const feed = model.calisaurus.feed
  const timesInUse = feed.map(n => new Date(n.date).getTime())
  const earliestTime = Math.min(...timesInUse)
  const latestTime = Math.max(...timesInUse)

  const earliestDate = new Date(earliestTime).toISOString().substring(0, 10)
  const latestDate = new Date(latestTime).toISOString().substring(0, 10)

  const uniqueGames = (new Array(...new Set(feed.map(g => g.name)))).sort()
  const uniqueGamesCount = uniqueGames.length
  report('Unique games count:', uniqueGamesCount, 'Earliest date', earliestDate, 'Latest Date', latestDate)

  const uniqueListOfGamesPlayed = { uniqueGames, uniqueGamesCount, earliestDate, latestDate }

  model.uniqueListOfGamesPlayed = uniqueListOfGamesPlayed
  return { uniqueListOfGamesPlayed: model.uniqueListOfGamesPlayed, log }
}

function init (model) {
  return () => createList(model)
}

module.exports = init
