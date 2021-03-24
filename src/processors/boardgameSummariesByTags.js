const reduceNameToBoardGameApiId = require('../util/reduceNameToBoardGameApiId')
const summariseGames = require('../util/summariseGames')

const log = []
const playRecordsWithMoreThanOneGameFamily = []
const report = (...messages) => log.push(['[Create Board Game Summaries by Tags]', ...messages].join(' '))

function copy (data) {
  return JSON.parse(JSON.stringify(data))
}

function findGameFamily ({ playRecords }) {
  const gameFamilies = playRecords.filter(rec => rec.gameFamily).map(rec => rec.gameFamily)
  if (gameFamilies.length > 1) {
    playRecordsWithMoreThanOneGameFamily.push(playRecords)
  }
  return gameFamilies[0] || 'Ungrouped'
}

async function createBoardGameSummariesByTags (model) {
  const { index } = model.calisaurus

  report('Index:', Object.keys(index).join(', '))
  report('Love Letter:', JSON.stringify(index['love-letter'], null, 2))

  report('Currently supported tags: gameFamily')
  const gameFamilies = Object.entries(index).reduce((acc, [name, gameData]) => {
    const gameFamily = findGameFamily(gameData)
    const gameFamilyId = reduceNameToBoardGameApiId(gameFamily)
    const entry = acc[gameFamilyId] || {
      name: (index[gameFamilyId] || {}).name || 'Ungrouped',
      gameFamilyId,
      playRecords: []
    }
    gameData.playRecords.forEach(rec => {
      const copiedRec = copy(rec)
      copiedRec.name = gameData.name
      entry.playRecords.push(copiedRec)
    })
    acc[gameFamilyId] = entry
    return acc
  }, {})

  Object.entries(gameFamilies).forEach(([gameFamilyId, entry]) => {
    const { playRecords } = entry
    const timesInUse = playRecords.map(n => new Date(n.date).getTime())

    const earliestTime = Math.min(...timesInUse)
    const latestTime = Math.max(...timesInUse)

    const earliestDate = new Date(earliestTime)
    const latestDate = new Date(latestTime)

    const stats = summariseGames({
      games: playRecords,
      startDate: earliestDate,
      endDate: latestDate
    })

    entry.earliestDate = earliestDate.toISOString().substring(0, 10)
    entry.latestDate = latestDate.toISOString().substring(0, 10)

    Object.assign(entry, stats)
  })

  const exampleDataStructure = {
    type: {
      strategy: {
        some: 'data for strategy games'
      },
      'worker-placement': {
        some: 'data for worker-placement games'
      }
    }
  }

  const summariesByTags = Object.assign({}, exampleDataStructure, { gameFamily: gameFamilies })

  return {
    summariesByTags: copy(summariesByTags),
    playRecordsWithMoreThanOneGameFamily,
    log
  }
}

function init (model) {
  return () => createBoardGameSummariesByTags(model)
}

module.exports = init
