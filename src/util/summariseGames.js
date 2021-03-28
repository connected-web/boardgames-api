const daysBetween = require('./daysBetween')
const sortByFeedPriority = require('./sortByFeedPriority')
const mostFrequentWordsIn = require('./mostFrequentWordsIn')

function fmn (n) {
  return Number.parseFloat(n.toFixed(4)) || 0
}

function summariseGames ({ games, startDate, endDate }) {
  const daysInSequence = daysBetween(startDate, endDate)
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
    const dayNumber = daysBetween(startDate, new Date(item.date))
    daysPlayedIndex[dayNumber] = (daysPlayedIndex[dayNumber] || 0) + 1
  })
  const daysPlayedList = Object.keys(daysPlayedIndex).map(n => {
    return {
      dayOfSequence: n,
      gamesPlayed: daysPlayedIndex[n] || 0
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
    const outcome = (n.coOpOutcome + '').toLowerCase().trim()
    return outcome === 'win' || outcome === 'won' || false
  }).length
  result.coOpGameLoses = result.coOpGamesPlayedCount - result.coOpGameWins
  result.coOpWinRate = fmn(result.coOpGameWins / result.coOpGamesPlayedCount)
  result.coOpLossRate = fmn(result.coOpGameLoses / result.coOpGamesPlayedCount)

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

module.exports = summariseGames
