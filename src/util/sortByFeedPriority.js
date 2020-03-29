function sortByFeedPriority (a, b) {
  const da = (new Date(a.date)).getTime()
  const db = (new Date(b.date)).getTime()
  const dateSort = da === db ? 0 : (da > db ? 1 : -1)
  if (dateSort !== 0) {
    console.log('Sorting by date', a.date, b.date, da, db, a.name, b.name, dateSort)
    return dateSort
  }

  const nameSort = (a.name + '').localeCompare((b.name + ''), 'en', {sensitivity: 'base'})
  if (nameSort !== 0) {
    console.log('Sorting by name', a.date, b.date, a.name, b.name, nameSort)
    return nameSort
  }
  
  const winnerSort = (a.winner + '').localeCompare((b.winner + ''), 'en', {sensitivity: 'base'})
  if (winnerSort !== 0) {
    return winnerSort
  }

  const coOpOutcomeSort = (a.coOpOutcome + '').localeCompare((b.coOpOutcome + ''), 'en', {sensitivity: 'base'})
  if (coOpOutcomeSort !== 0) {
    return coOpOutcomeSort
  }

  return 0
}

module.exports = sortByFeedPriority