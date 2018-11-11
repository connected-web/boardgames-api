const { position } = require('promise-path')
const writeFile = require('./util/writeFile')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Summaries]', ...messages)

const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function daysInMonth (month, year) {
  return new Date(year, month + 1, 0).getDate()
}

function fmn (n) {
  return Number.parseFloat(n.toFixed(4))
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
    report('Processing', dateCode, 'Y:', year, 'M:', month, 'D:', daysInMonth(month, year))
    return {
      dateCode,
      daysInMonth: daysInMonth(month, year),
      title: [monthsOfTheYear[month], year].join(' ')
    }
  })

  monthsInUse.forEach((month) => {
    const games = collection.feed.filter(n => n.date.substring(0, 7) === month.dateCode)
    const coOpGames = games.filter(n => (n.coOp + '').toLowerCase().trim() === 'yes')
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

    const daysPlayedIndex = {}
    let n = 0
    while (n < month.daysInMonth) {
      n++
      daysPlayedIndex[n] = 0
    }
    games.forEach(item => {
      const dayNumber = (new Date(item.date)).getUTCDate()
      daysPlayedIndex[dayNumber]++
    })
    const daysPlayedList = Object.keys(daysPlayedIndex).map(n => {
      return {
        dayOfMonth: n,
        gamesPlayed: daysPlayedIndex[n]
      }
    })
    month.daysWithUnplayedGames = daysPlayedList.filter(d => d.gamesPlayed === 0).map(d => d.dayOfMonth).length
    month.gamesPlayedPerDay = daysPlayedIndex

    const dayCountIndex = games.reduce((acc, item) => {
      const entry = acc[item.date] || {
        date: item.date,
        games: []
      }
      entry.games.push(item.game)
      acc[item.date] = entry
      return acc
    }, {})

    let dayCountList = []
    Object.keys(dayCountIndex).forEach(key => {
      const entry = dayCountIndex[key]
      dayCountList.push(entry)
    })
    dayCountList = dayCountList.sort((a, b) => a.games.length < b.games.length ? 1 : -1)

    month.gamesPlayed = games.sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return da > db ? 1 : -1
    })

    month.totalGamesPlayed = games.length
    month.averageGamesPlayedPerDay = fmn(month.totalGamesPlayed / month.daysInMonth)
    const highestDayPlayCount = dayCountList[0].games.length
    month.mostGamesPlayedInADay = dayCountList.filter(n => n.games.length === highestDayPlayCount)
    const highestGamePlayCount = gameCountList[0].plays
    month.mostPlayedGamesThisMonth = gameCountList.filter(n => n.plays === highestGamePlayCount)
    month.coOpGamesPlayedCount = coOpGames.length
    month.coOpGamesPlayedPercentage = fmn(month.coOpGamesPlayedCount / month.totalGamesPlayed)
    month.coOpGameWins = coOpGames.filter(n => {
      let outcome = (n.coOpOutcome + '').toLowerCase().trim()
      return outcome === 'win' || outcome === 'won' || false
    }).length
    month.coOpGameLoses = month.coOpGamesPlayedCount - month.coOpGameWins
    month.winCountHannah = games.filter(n => (n.winner + '').toLowerCase().trim() === 'hannah').length
    month.winCountJohn = games.filter(n => (n.winner + '').toLowerCase().trim() === 'john').length
    month.winCountOther = games.filter(n => (n.winner + '').toLowerCase().trim() === 'other').length
    month.winCountDraw = games.filter(n => (n.winner + '').toLowerCase().trim() === 'draw').length
    month.winnableGamesTotal = month.winCountHannah + month.winCountJohn + month.winCountOther + month.winCountDraw
    month.winRateHannah = fmn(month.winCountHannah / month.winnableGamesTotal)
    month.winRateJohn = fmn(month.winCountJohn / month.winnableGamesTotal)
    month.winRateOther = fmn(month.winCountOther / month.winnableGamesTotal)
    month.winRateDraw = fmn(month.winCountDraw / month.winnableGamesTotal)
    month.mostWonGames = month.winCountHannah > month.winCountJohn ? 'Hannah' : 'John'
    month.mostWonGames = month.winCountHannah === month.winCountJohn ? 'Draw' : month.mostWonGames
  })

  summaries.earliestDate = new Date(earliestTime).toISOString().substring(0, 10)
  summaries.latestDate = new Date(latestTime).toISOString().substring(0, 10)
  summaries.byMonth = monthsInUse

  async function writeMonth (month) {
    const filename = `boardgame-summary-${month.dateCode}.json`
    return writeFile('Board Game Summary', filename, month)
  }

  await Promise.all(monthsInUse.map(writeMonth))

  return writeFile('Board Game Summaries', 'boardgame-summaries.json', summaries)
}

module.exports = start
