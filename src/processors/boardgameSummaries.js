const log = []
const daysBetween = require('../util/daysBetween')
const summariseGames = require('../util/summariseGames')
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
    Object.assign(dataForYear, result)
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
  summaries.byAllTime = byAllTime

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
