const log = []
const sortByFeedPriority = require('../util/sortByFeedPriority')
const mostFrequentWordsIn = require('../util/mostFrequentWordsIn')
const report = (...messages) => log.push(['[Create Board Game Summaries]', ...messages].join(' '))

const monthsOfTheYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function currentDate () {
  return new Date()
}

function firstDayInYear () {
  const date = currentDate()
  const year = date.getUTCFullYear()

  return new Date(year, 0, 1, 2, 1, 0)
}

function firstDayInMonth () {
  const date = currentDate()
  const month = date.getUTCMonth()
  const year = date.getUTCFullYear()

  return new Date(year, month, 1, 2, 1, 0)
}

function fmn (n) {
  return Number.parseFloat(n.toFixed(4))
}

function daysBetween (firstDate, secondDate) {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000
  const firstTime = firstDate.getTime()
  const secondTime = secondDate.getTime()
  const millisecondsBetween = Math.abs(firstTime - secondTime)
  return Math.round(millisecondsBetween / oneDayInMilliseconds)
}

function copy (data) {
  return JSON.parse(JSON.stringify(data))
}

async function createBoardGameSummaries (model) {
  const collection = model.calisaurus
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
    report('Processing', dateCode, 'Y:', year, 'M:', month)
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

  function summariseGames ({ games, startDate, endDate }) {
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

    result.gamesPlayed = games.sort(sortByFeedPriority)

    result.totalGamesPlayed = games.length
    result.averageGamesPlayedPerDay = fmn(result.totalGamesPlayed / daysInSequence)
    const highestDayPlayCount = dayCountList.length > 0 ? dayCountList[0].games.length : 0
    result.mostGamesPlayedInADay = dayCountList.filter(n => n.games.length === highestDayPlayCount).sort(sortByFeedPriority)
    const highestGamePlayCount = gameCountList.length > 0 ? gameCountList[0].plays : 0

    result.uniqueGamesPlayed = [...new Set(games.map(g => g.name))].sort()
    result.uniqueGamesPlayedCount = result.uniqueGamesPlayed.length
    result.uniqueGamesPlayedPercentage = fmn(result.uniqueGamesPlayedCount / result.totalGamesPlayed)

    result.mostPlayedGames = gameCountList.filter(n => n.plays === highestGamePlayCount).sort(sortByFeedPriority)
    result.coOpGamesPlayedCount = coOpGames.length
    result.coOpGamesPlayedPercentage = fmn(result.coOpGamesPlayedCount / result.totalGamesPlayed)
    result.coOpGameWins = coOpGames.filter(n => {
      let outcome = (n.coOpOutcome + '').toLowerCase().trim()
      return outcome === 'win' || outcome === 'won' || false
    }).length
    result.coOpGameLoses = result.coOpGamesPlayedCount - result.coOpGameWins

    const gamesWonByHannah = games.filter(n => (n.winner + '').toLowerCase().trim() === 'hannah')
    const gamesWonByJohn = games.filter(n => (n.winner + '').toLowerCase().trim() === 'john')
    const gamesWonByOther = games.filter(n => (n.winner + '').toLowerCase().trim() === 'other')
    const gamesThatWereDrawn = games.filter(n => (n.winner + '').toLowerCase().trim() === 'draw')

    result.winCountHannah = gamesWonByHannah.length
    result.winCountJohn = gamesWonByJohn.length
    result.winCountOther = gamesWonByOther.length
    result.winCountDraw = gamesThatWereDrawn.length
    result.winnableGamesTotal = result.winCountHannah + result.winCountJohn + result.winCountOther + result.winCountDraw
    result.winPercentageHannah = fmn(result.winCountHannah / result.winnableGamesTotal)
    result.winPercentageJohn = fmn(result.winCountJohn / result.winnableGamesTotal)
    result.winPercentageOther = fmn(result.winCountOther / result.winnableGamesTotal)
    result.winPercentageDraw = fmn(result.winCountDraw / result.winnableGamesTotal)
    result.mostWonGames = result.winCountHannah > result.winCountJohn ? 'Hannah' : 'John'
    result.mostWonGames = result.winCountHannah === result.winCountJohn ? 'Draw' : result.mostWonGames
    result.mostWonGamesJohn = mostFrequentWordsIn(gamesWonByJohn.map(g => g.name)).map(r => {
      return {
        game: r.word,
        plays: r.count
      }
    }).sort(sortByFeedPriority)
    result.mostWonGamesHannah = mostFrequentWordsIn(gamesWonByHannah.map(g => g.name)).map(r => {
      return {
        game: r.word,
        plays: r.count
      }
    }).sort(sortByFeedPriority)

    return result
  }

  monthsInUse.forEach((dataForMonth) => {
    const games = collection.feed.filter(n => n.date.substring(0, 7) === dataForMonth.dateCode)

    const date = new Date(dataForMonth.dateCode)
    const month = date.getUTCMonth()
    const year = date.getUTCFullYear()

    const startDate = new Date(year, month, 1, 2, 1, 0)
    const endDate = new Date(year, month + 1, 0, 2, 1, 0)

    const result = summariseGames({
      games,
      startDate,
      endDate
    })
    Object.entries(result).forEach(kvp => {
      dataForMonth[kvp[0]] = kvp[1]
    })
  })

  yearsInUse.forEach((dataForYear) => {
    const games = collection.feed.filter(n => n.date.substring(0, 4) === dataForYear.dateCode)

    const date = new Date(dataForYear.dateCode)
    const year = date.getUTCFullYear()

    const startDate = new Date(year, 0, 1, 2, 1, 0)
    const endDate = new Date(year + 1, 0, 0, 2, 1, 0)

    const result = summariseGames({
      games,
      startDate,
      endDate
    })
    Object.entries(result).forEach(kvp => {
      dataForYear[kvp[0]] = kvp[1]
    })
  })

  const earliestDate = new Date(earliestTime)
  const latestDate = new Date(latestTime)
  summaries.earliestDate = earliestDate.toISOString().substring(0, 10)
  summaries.latestDate = latestDate.toISOString().substring(0, 10)
  summaries.numberOfDaysCovered = daysBetween(earliestDate, latestDate)
  summaries.byMonth = monthsInUse
  summaries.byYear = yearsInUse

  const currentYear = currentDate().toISOString().substring(0, 4)
  const gamesForYearToDate = collection.feed.filter(n => n.date.substring(0, 4) === currentYear)
  const yearToDate = summariseGames({
    games: gamesForYearToDate,
    startDate: firstDayInYear(),
    endDate: currentDate()
  })

  const currentMonth = currentDate().toISOString().substring(0, 7)
  const gamesForMonthToDate = collection.feed.filter(n => n.date.substring(0, 7) === currentMonth)
  report('Games For Month To Date', gamesForMonthToDate.length, currentMonth)
  const monthToDate = summariseGames({
    games: gamesForMonthToDate,
    startDate: firstDayInMonth(),
    endDate: currentDate()
  })

  const byAllTime = summariseGames({
    games: collection.feed,
    startDate: earliestDate,
    endDate: latestDate
  })

  return {
    summaries: copy(summaries),
    monthsInUse: copy(monthsInUse),
    yearsInUse: copy(yearsInUse),
    monthToDate: copy(monthToDate),
    yearToDate: copy(yearToDate),
    byAllTime: copy(byAllTime),
    log
  }
}

function init (model) {
  return () => createBoardGameSummaries(model)
}

module.exports = init
