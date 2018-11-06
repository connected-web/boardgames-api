const { position } = require('promise-path')
const writeFile = require('./util/writeFile')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Unique List of Played Games]', ...messages)

async function start () {
  report('Requires', 'data/boardgame-feed.json')
  const boardGameFeed = require(datapath('boardgame-feed.json'))
  const feed = boardGameFeed.feed || []

  const timesInUse = feed.map(n => new Date(n.date).getTime())
  const earliestTime = Math.min(...timesInUse)
  const latestTime = Math.max(...timesInUse)

  const earliestDate = new Date(earliestTime).toISOString().substring(0, 10)
  const latestDate = new Date(latestTime).toISOString().substring(0, 10)

  const uniqueGames = (new Array(...new Set(feed.map(g => g.game)))).sort()
  const uniqueGamesCount = uniqueGames.length
  report('Unique games', uniqueGames, 'Count:', uniqueGamesCount)

  const uniqueListOfGamesPlayed = { uniqueGames, uniqueGamesCount, earliestDate, latestDate }
  return writeFile('Unique List of Games Played', 'unique-list-of-games-played.json', uniqueListOfGamesPlayed)
}

module.exports = start
