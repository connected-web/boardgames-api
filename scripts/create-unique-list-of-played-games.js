const report = (...messages) => console.log('[Create Unique List of Played Games]', ...messages)
const { model, uniqueListOfGamesPlayed } = require('../')

async function start () {
  report('Requires', 'data/boardgame-feed.json')

  const { calisaurus, readers, writers } = await model()
  const { readJson } = readers
  const { writeJson } = writers

  calisaurus.feed = (await readJson('boardgame-feed.json')).feed
  const { uniqueGames, uniqueGamesCount, earliestDate, latestDate } = await uniqueListOfGamesPlayed()
  report('Unique games count:', uniqueGamesCount, 'Earliest date', earliestDate, 'Latest Date', latestDate)

  const output = { uniqueGames, uniqueGamesCount, earliestDate, latestDate }
  return writeJson('Unique List of Games Played', 'unique-list-of-games-played.json', output)
}

module.exports = start
