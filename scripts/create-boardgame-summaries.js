const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Summaries]', ...messages)

const template = `Total games played: 39

Days missed: 0

Most games played in a day: 4

Most played game: Yam Yam with 4 plays

Percentage of co-operative games played: 25.6% (10 games), 4 wins and 6 losses

Win rates between Hannah and John in versus games: 30% (9 games) to John, 63.3% (19 games) to Hannah, and 6.7% (2 games) to other people

Largest game played: The Mind, Space Base, Skull, and Exploding Kittens each with 4 players

Complete List of Games Played In September:`

const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}

async function start () {
  report('Requires', 'data/boardgame-feed.json')

  const collection = require(datapath('boardgame-feed.json'))
  const summaries = {
    byMonth: [],
    byYear: []
  }

  const timesInUse = collection.feed.map(n => new Date(n.date).getTime())
  const earliestTime = Math.min(...timesInUse)
  const latestTime = Math.max(...timesInUse)
  const monthsInUse = [...new Set(timesInUse.map((t) => {
    return new Date(t).toISOString().substring(0, 7)
  }))].map(dateCode => {
    const date = new Date(dateCode)
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    return {
      dateCode,
      daysInMonth: daysInMonth(month, year),
      title: [monthsOfTheYear[month], year].join(' ')
    }
  })

  monthsInUse.forEach((month) => {
    const games = collection.feed.filter(n => n.date.substring(0, 7) === month.dateCode)
    const gameCountIndex = games.reduce((acc, item) => {
      const entry = acc[item.game] || {
        game: item.game,
        plays: 0
      }
      entry.plays++
      acc[item.game] = entry
      return acc
    }, {})

    let gameCountList = []
    Object.keys(gameCountIndex).forEach(key => {
      const entry = gameCountIndex[key]
      gameCountList.push(entry)
    })
    gameCountList = gameCountList.sort((a, b) => a.plays < b.plays ? 1 : -1)

    month.totalGamesPlayed = games.length
    month.averageGamesPlayedPerDay = Number.parseFloat((month.totalGamesPlayed / month.daysInMonth).toFixed(2))
    month.mostGamesPlayedInADay = '?'
    const highestPlayCount = gameCountList[0].plays
    month.mostPlayedGamesThisMonth = gameCountList.filter(n => n.plays === highestPlayCount)
  })

  summaries.earliestDate = new Date(earliestTime).toISOString().substring(0, 10)
  summaries.latestDate = new Date(latestTime).toISOString().substring(0, 10)
  summaries.monthsInUse = monthsInUse

  const filename = 'boardgame-summaries.json'
  report('Writing file:', filename, summaries)
  return write(datapath(filename), JSON.stringify(summaries, null, 2), 'utf8')
}

module.exports = start
