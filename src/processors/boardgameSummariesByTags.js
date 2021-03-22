const reduceNameToBoardGameApiId = require('../util/reduceNameToBoardGameApiId')

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

  report('TODO: Time to get tagging?')
  report('Index:', Object.keys(index).join(', '))
  report('Love Letter:', JSON.stringify(index['love-letter'], null, 2))

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
