const { position } = require('promise-path')
const writeFile = require('../src/util/writeJson')
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
  const monthsInUse = [...new Set(timesInUse.map(t => {
    return new Date(t).toISOString().substring(0, 7)
  }))].map(dateCode => {
    const date = new Date(dateCode)
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    report('Processing', dateCode, 'Y:', year, 'M:', month, 'D:', daysInMonth(month, year))
    return {
      dateCode,
      title: [monthsOfTheYear[month], year].join(' ')
    }
  })

  const yearsInUse = [...new Set(timesInUse.map(t => {
    return new Date(t).toISOString().substring(0, 4)
  }))].map(dateCode => {
    const date = new Date(dateCode)
    const year = date.getUTCFullYear()
    report('Processing', dateCode, 'Y:', year)
    return {
      dateCode,
      title: dateCode
    }
  })

  function summariseGames (games) {
    const startDate = new Date(games.map(g => new Date(g.date).getTime()).sort((a, b) => a - b)[0])
    const endDate = new Date(games.map(g => new Date(g.date).getTime()).sort((a, b) => b - a)[0])
    const daysInSequence = daysBetween(startDate, endDate) + 1
    const result = {
      sequenceStartDate: startDate.toISOString().substring(0, 10),
      sequenceEndDate: endDate.toISOString().substring(0, 10)
    }
    const coOpGames = games.filter(n => (n.coOp + '').toLowerCase().trim() === 'yes')
    const gameCountIndex = games.reduce((acc, item) => {
      const entry = acc[item.name] || {
        name: item.name,
        plays: 0
      }
      entry.plays++
      acc[item.name] = entry
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
    while (n < daysInSequence) {
      n++
      daysPlayedIndex[n] = 0
    }
    games.forEach(item => {
      const dayNumber = daysBetween(startDate, new Date(item.date)) + 1
      daysPlayedIndex[dayNumber]++
    })
    const daysPlayedList = Object.keys(daysPlayedIndex).map(n => {
      return {
        dayOfSequence: n,
        gamesPlayed: daysPlayedIndex[n]
      }
    })
    result.daysInSequence = daysInSequence
    result.daysWithUnplayedGames = daysPlayedList.filter(d => d.gamesPlayed === 0).map(d => d.dayOfMonth).length
    result.gamesPlayedPerDay = daysPlayedIndex

    const dayCountIndex = games.reduce((acc, item) => {
      const entry = acc[item.date] || {
        date: item.date,
        games: []
      }
      entry.games.push(item.name)
      acc[item.date] = entry
      return acc
    }, {})

    let dayCountList = []
    Object.keys(dayCountIndex).forEach(key => {
      const entry = dayCountIndex[key]
      dayCountList.push(entry)
    })
    dayCountList = dayCountList.sort((a, b) => a.games.length < b.games.length ? 1 : -1)

    result.gamesPlayed = games.sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return da > db ? 1 : -1
    })

    result.uniqueGamesPlayed = [...new Set(games.map(g => g.name))].sort()
    result.uniqueGamesPlayedCount = result.uniqueGamesPlayed.length

    result.totalGamesPlayed = games.length
    result.averageGamesPlayedPerDay = fmn(result.totalGamesPlayed / daysInSequence)
    const highestDayPlayCount = dayCountList[0].games.length
    result.mostGamesPlayedInADay = dayCountList.filter(n => n.games.length === highestDayPlayCount)
    const highestGamePlayCount = gameCountList[0].plays
    result.mostPlayedGames = gameCountList.filter(n => n.plays === highestGamePlayCount)
    result.coOpGamesPlayedCount = coOpGames.length
    result.coOpGamesPlayedPercentage = fmn(result.coOpGamesPlayedCount / result.totalGamesPlayed)
    result.coOpGameWins = coOpGames.filter(n => {
      let outcome = (n.coOpOutcome + '').toLowerCase().trim()
      return outcome === 'win' || outcome === 'won' || false
    }).length
    result.coOpGameLoses = result.coOpGamesPlayedCount - result.coOpGameWins
    result.winCountHannah = games.filter(n => (n.winner + '').toLowerCase().trim() === 'hannah').length
    result.winCountJohn = games.filter(n => (n.winner + '').toLowerCase().trim() === 'john').length
    result.winCountOther = games.filter(n => (n.winner + '').toLowerCase().trim() === 'other').length
    result.winCountDraw = games.filter(n => (n.winner + '').toLowerCase().trim() === 'draw').length
    result.winnableGamesTotal = result.winCountHannah + result.winCountJohn + result.winCountOther + result.winCountDraw
    result.winRateHannah = fmn(result.winCountHannah / result.winnableGamesTotal)
    result.winRateJohn = fmn(result.winCountJohn / result.winnableGamesTotal)
    result.winRateOther = fmn(result.winCountOther / result.winnableGamesTotal)
    result.winRateDraw = fmn(result.winCountDraw / result.winnableGamesTotal)
    result.mostWonGames = result.winCountHannah > result.winCountJohn ? 'Hannah' : 'John'
    result.mostWonGames = result.winCountHannah === result.winCountJohn ? 'Draw' : result.mostWonGames

    return result
  }

  monthsInUse.forEach((month) => {
    const games = collection.feed.filter(n => n.date.substring(0, 7) === month.dateCode)
    const result = summariseGames(games)
    Object.entries(result).forEach(kvp => {
      month[kvp[0]] = kvp[1]
    })
  })

  yearsInUse.forEach((year) => {
    const games = collection.feed.filter(n => n.date.substring(0, 4) === year.dateCode)
    const result = summariseGames(games)
    Object.entries(result).forEach(kvp => {
      year[kvp[0]] = kvp[1]
    })
  })

  function daysBetween (firstDate, secondDate) {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000
    const firstTime = firstDate.getTime()
    const secondTime = secondDate.getTime()
    const millisecondsBetween = Math.abs(firstTime - secondTime)
    return Math.round(millisecondsBetween / oneDayInMilliseconds)
  }

  const earliestDate = new Date(earliestTime)
  const latestDate = new Date(latestTime)
  summaries.earliestDate = earliestDate.toISOString().substring(0, 10)
  summaries.latestDate = latestDate.toISOString().substring(0, 10)
  summaries.numberOfDaysCovered = daysBetween(earliestDate, latestDate)
  summaries.byMonth = monthsInUse
  summaries.byYear = yearsInUse

  const byAllTime = summariseGames(collection.feed, summaries.numberOfDaysCovered)

  async function writeMonth (month) {
    const filename = `summaries/boardgame-summary-${month.dateCode}.json`
    return writeFile('Board Game Summary', filename, month)
  }

  async function writeYear (year) {
    const filename = `summaries/boardgame-summary-${year.dateCode}.json`
    return writeFile('Board Game Summary', filename, year)
  }

  await Promise.all(monthsInUse.map(writeMonth))
  await Promise.all(yearsInUse.map(writeYear))
  await writeFile('All time board game summary', 'summaries/boardgame-summary-all-time.json', byAllTime)

  return writeFile('Board Game Summaries', 'boardgame-summaries.json', summaries)
}

module.exports = start
