const log = []
const report = (...messages) => log.push(['[Board Game Challenge Grids]', ...messages].join(' '))

const mutateRemoveEmpty = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      mutateRemoveEmpty(obj[key])
    } else if (obj[key] == null) {
      delete obj[key]
    }
  })
}

function fmn (n) {
  return Number.parseFloat(n.toFixed(4)) || 0
}

const challenges = {
  2018: {
    gameFamilies: [
      'Flotsam Fight',
      'Jurassic Snack',
      'Love Letter',
      'Mint Works',
      'Corsairs of Valeria',
      'Deep Sea Adventure',
      'Lovecraft Letter',
      'Design Town',
      'Topiary',
      'Dominion',
      '7 Wonders',
      'Star Realms',
      'Pandemic',
      'Tanto Cuore',
      'Ticket to Ride',
      'Valeria Card Kingdoms',
      'Aeon\'s End',
      'Wingspan',
      'Brass',
      'Scythe',
      'Wilcard *'
    ],
    gamesToPlayCountPerFamily: 10
  },
  2019: {
    gameFamilies: [],
    gamesToPlayCountPerFamily: 0
  },
  2020: {
    gameFamilies: [
      'Flotsam Fight',
      'Jurassic Snack',
      'Love Letter',
      'Mint Works',
      'Corsairs of Valeria',
      'Deep Sea Adventure',
      'Lovecraft Letter',
      'Design Town',
      'Topiary',
      'Dominion',
      '7 Wonders',
      'Star Realms',
      'Pandemic',
      'Tanto Cuore',
      'Ticket to Ride',
      'Valeria Card Kingdoms',
      'Aeon\'s End',
      'Wingspan',
      'Brass',
      'Scythe',
      'Wilcard *'
    ],
    gamesToPlayCountPerFamily: 10
  },
  2021: {
    gameFamilies: [
      'Flotsam Fight',
      'Jurassic Snack',
      'Love Letter',
      'Mint Works',
      'Corsairs of Valeria',
      'Deep Sea Adventure',
      'Lovecraft Letter',
      'Design Town',
      'Topiary',
      'Dominion',
      '7 Wonders',
      'Star Realms',
      'Pandemic',
      'Tanto Cuore',
      'Ticket to Ride',
      'Valeria Card Kingdoms',
      'Aeon\'s End',
      'Wingspan',
      'Brass',
      'Scythe',
      'Wilcard *'
    ],
    gamesToPlayCountPerFamily: 20
  }
}

function createChallengeGridForYear (challenge, year) {
  const { gameFamilies, gamesToPlayCountPerFamily } = challenge
  return {
    dateCode: `${year}`,
    title: `Challenge Grid for ${year}`,
    challenge: {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      gameFamilies,
      gameFamiliesCount: gameFamilies.length,
      gamesToPlayCountPerFamily
    },
    grid: [],
    overview: {
      gamesPlayedCount: 0,
      totalGamesToPlayCount: 0,
      gamesPlayedPercentage: 0
    },
    sequence: {
      startDate: `${year}-01-01`,
      endDate: `${year}-01-01`,
      daysInSequence: 1
    }
  }
}

function isDateInRange (dateString, startDateString, endDateString) {
  const needle = new Date(dateString)
  const startDate = new Date(startDateString)
  const endDate = new Date(endDateString)
  return needle.getTime() >= startDate.getTime() && needle.getTime() <= endDate.getTime()
}

function calculateChallengeGridOverview (challengeGrid) {
  const { overview, challenge } = challengeGrid
  overview.totalGamesToPlayCount = challenge.gamesToPlayCountPerFamily * challenge.gameFamiliesCount
  overview.gamesPlayedPercentage = fmn(overview.gamesPlayedCount / overview.totalGamesToPlayCount)
}

function populateChallengeGrid (challengeGrid, gameFamily, boardGameFeed) {
  const { overview, challenge, grid } = challengeGrid
  const { startDate, endDate, gamesToPlayCountPerFamily } = challenge
  const gameStats = boardGameFeed.filter(game => {
    try {
      return isDateInRange(game.date, startDate, endDate) && (game.gameFamily === gameFamily || game.name.includes(gameFamily))
    } catch (ex) {
      console.error('Unable to match:', game, 'due to:', ex)
    }
  })
  const gridEntry = {
    gameFamily,
    gameStats,
    gamesPlayedCount: gameStats.length,
    gamesPlayedPercentage: fmn(gameStats.length / gamesToPlayCountPerFamily)
  }
  report(startDate, 'to', endDate, ': found', gameStats.length, 'games for', gameFamily)
  grid.push(gridEntry)
  overview.gamesPlayedCount = overview.gamesPlayedCount + gameStats.length
}

async function createChallengeGrids (model) {
  const boardGameFeed = model.calisaurus.feed
  const gridsByYear = {}

  report(`Create grids by year from ${boardGameFeed.length} items`)

  const challengeGrids = Object.entries(challenges).map(([year, challenge]) => {
    report('Challenge', year, JSON.stringify(challenge))
    return createChallengeGridForYear(challenge, year)
  })

  challengeGrids.forEach(challengeGrid => {
    report('Populating', challengeGrid.dateCode)
    challengeGrid.challenge.gameFamilies.forEach((gameFamily) => populateChallengeGrid(challengeGrid, gameFamily, boardGameFeed))
    calculateChallengeGridOverview(challengeGrid)
  })

  const challengeGridsByYear = challengeGrids.filter(grid => grid.dateCode.length === 4)
  challengeGridsByYear.forEach(challengeGrid => {
    gridsByYear[challengeGrid.dateCode] = challengeGrid
  })

  mutateRemoveEmpty(gridsByYear)

  model.calisaurus.challengeGrids = { byYear: gridsByYear }

  return { byYear: gridsByYear, log }
}

function init (model) {
  return () => createChallengeGrids(model)
}

module.exports = init
