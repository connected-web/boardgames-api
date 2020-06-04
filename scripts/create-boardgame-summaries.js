const report = (...messages) => console.log('[Create Board Game Summaries]', ...messages)
const { model, boardgameSummaries } = require('../')

async function start () {
  report('Requires', 'data/boardgame-feed.json')

  const { calisaurus, readers, writers } = await model()
  const { readJson } = readers
  const { writeJson } = writers

  calisaurus.feed = (await readJson('boardgame-feed.json')).feed
  const { summaries, monthsInUse, yearsInUse, monthToDate, yearToDate, byAllTime } = await boardgameSummaries()

  async function writeMonth (month) {
    const filename = `summaries/boardgame-summary-${month.dateCode}.json`
    return writeJson('Board Game Summary for ' + month.dateCode, filename, month)
  }

  async function writeYear (year) {
    const filename = `summaries/boardgame-summary-${year.dateCode}.json`
    return writeJson('Board Game Summary for ' + year.dateCode, filename, year)
  }

  async function writeMonthToDate (summary) {
    const filename = `summaries/boardgame-summary-month-to-date.json`
    return writeJson('Board Game Summary for Month to Date', filename, summary)
  }

  async function writeYearToDate (summary) {
    const filename = `summaries/boardgame-summary-year-to-date.json`
    return writeJson('Board Game Summary for Year to Date', filename, summary)
  }

  await Promise.all(monthsInUse.map(writeMonth))
  await Promise.all(yearsInUse.map(writeYear))
  await writeMonthToDate(monthToDate)
  await writeYearToDate(yearToDate)
  await writeJson('All time board game summary', 'summaries/boardgame-summary-all-time.json', byAllTime)

  return writeJson('Board Game Summaries', 'boardgame-summaries.json', summaries)
}

module.exports = start
