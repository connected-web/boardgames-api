const convertGSheetsDate = require('../util/convertGSheetsDate')
const reduceNameToBoardGameApiId = require('../util/reduceNameToBoardGameApiId')
const log = []
const report = (...messages) => log.push(['[Create Board Game Index]', ...messages].join(' '))

const expectedProperties = ['date', 'game', 'winner', 'coOpOutcome', 'coOp', 'notes', 'mechanics']
const playRecordProperties = ['date', 'winner', 'coOpOutcome', 'notes', 'coOp', 'mechanics']
const clone = d => JSON.parse(JSON.stringify(d))

function fmn (n) {
  return (n && Number.parseFloat(n.toFixed(4))) || 0
}

async function createIndex (model) {
  const collection = model.boardGameGeek.collection
  const caliPlayStats = model.calisaurus.playstats

  const boardGameIndex = {}
  collection.items[0].item.reduce(mapBoardGameGeekGame, boardGameIndex)
  caliPlayStats.reduce(mapCaliPlayStatGame, boardGameIndex)

  function mapBoardGameGeekGame (accumulator, item) {
    const name = item.name[0]._text[0]
    const id = item._attributes.objectid
    const boardGameApiId = reduceNameToBoardGameApiId(name)
    accumulator[boardGameApiId] = {
      boardGameGeekGameId: id,
      boardGameGeekName: name,
      boardGameApiId: boardGameApiId,
      name,
      playRecords: []
    }
    return accumulator
  }

  function mapCaliPlayStatGame (accumulator, item) {
    const name = item.game
    if (name) {
      const boardGameApiId = reduceNameToBoardGameApiId(name)
      const entry = accumulator[boardGameApiId] || { boardGameApiId, playRecords: [], name }
      const playRecord = {}
      expectedProperties.forEach(key => {
        let value = item[key]
        if (key.toLowerCase().includes('date')) {
          value = convertGSheetsDate(value)
        }

        if (playRecordProperties.includes(key)) {
          playRecord[key] = value
        }
      })
      entry.playRecords.push(playRecord)
      accumulator[boardGameApiId] = entry
    } else {
      report('No name found on item:', JSON.stringify(item))
    }
    return accumulator
  }

  model.calisaurus.index = boardGameIndex

  await Promise.all(Object.entries(boardGameIndex).map(async kvp => {
    const [boardGameApiId, entry] = kvp
    let revisedEntry = performFurtherAnalysis(entry)
    revisedEntry = await addBGGData(revisedEntry, model)
    model.calisaurus.index[boardGameApiId] = revisedEntry
  }))

  return { index: model.calisaurus.index, log }
}

function performFurtherAnalysis (entry) {
  const result = clone(entry)

  const playRecords = result.playRecords
  result.totalGamesPlayed = playRecords.length

  const coOpGames = playRecords.filter(n => (n.coOp + '').toLowerCase().trim() === 'yes')
  result.coOpGamesPlayedCount = coOpGames.length
  result.coOpGamesPlayedPercentage = fmn(result.coOpGamesPlayedCount / result.totalGamesPlayed)
  result.coOpGameWins = coOpGames.filter(n => {
    const outcome = (n.coOpOutcome + '').toLowerCase().trim()
    return outcome === 'win' || outcome === 'won' || false
  }).length
  result.coOpGameLoses = result.coOpGamesPlayedCount - result.coOpGameWins
  result.coOpWinRate = fmn(result.coOpGameWins / result.coOpGamesPlayedCount)
  result.coOpLossRate = fmn(result.coOpGameLoses / result.coOpGamesPlayedCount)
  result.winCountHannah = playRecords.filter(r => (r.winner + '').toLowerCase() === 'hannah').length
  result.winCountJohn = playRecords.filter(r => (r.winner + '').toLowerCase() === 'john').length
  result.winCountOther = playRecords.filter(r => (r.winner + '').toLowerCase() === 'other').length
  result.winCountDraw = playRecords.filter(r => (r.winner + '').toLowerCase() === 'draw').length
  result.winnableGamesTotal = result.winCountHannah + result.winCountJohn + result.winCountOther + result.winCountDraw
  result.winPercentageHannah = fmn(result.winCountHannah / result.winnableGamesTotal)
  result.winPercentageJohn = fmn(result.winCountJohn / result.winnableGamesTotal)
  result.winPercentageOther = fmn(result.winCountOther / result.winnableGamesTotal)
  result.winPercentageDraw = fmn(result.winCountDraw / result.winnableGamesTotal)
  result.mostWonGames = result.winCountHannah > result.winCountJohn ? 'Hannah' : 'John'
  result.mostWonGames = result.winCountHannah === result.winCountJohn ? 'Draw' : result.mostWonGames

  return result
}

async function addBGGData (entry, model) {
  const result = clone(entry)
  const bggId = entry.boardGameGeekGameId
  if (!bggId) {
    report(entry, 'has no Board Game Geek Game Id', bggId)
    return result
  }

  try {
    const bggGameData = model.boardGameGeek.index[bggId]
    const bggGameEntry = bggGameData.items[0].item[0]
    result.description = entry.description || bggGameEntry.description[0]._text[0].split('&#10;').filter(n => n)
  } catch (ex) {
    report('No description found for board game geek entry', `boardgame-${bggId}`, ex)
  }

  return result
}

function init (model) {
  return () => createIndex(model)
}

module.exports = init
