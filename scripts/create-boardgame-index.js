const { position, clean } = require('promise-path')
const writeFile = require('./util/writeFile')
const convertGSheetsDate = require('./util/convertGSheetsDate')
const reduceNameToBoardGameApiId = require('./util/reduceNameToBoardGameApiId')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Index]', ...messages)

const expectedProperties = ['date', 'game', 'winner', 'coOpOutcome', 'coOp', 'notes', 'mechanics']
const playRecordProperties = ['date', 'winner', 'coOpOutcome', 'notes', 'coOp', 'mechanics']
const clone = d => JSON.parse(JSON.stringify(d))

function fmn (n) {
  return (n && Number.parseFloat(n.toFixed(4))) || 0
}

async function start () {
  report('Requires data/bgg-collection.json')
  report('Requires data/cali-playstats.json')

  const collection = require(datapath('bgg-collection.json'))
  const caliPlayStats = require(datapath('cali-playstats.json'))

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
    const boardGameApiId = reduceNameToBoardGameApiId(name)
    const entry = accumulator[boardGameApiId] || {boardGameApiId, playRecords: [], name}
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
    return accumulator
  }

  const boardGameApiIds = Object.entries(boardGameIndex).map(kvp => kvp[1].boardGameApiId).sort()

  report('Cleaning out the /data/index/ path')
  await clean(datapath('/index'))
  await writeFile('Board Game API IDs', 'boardgame-api-ids.json', {boardGameApiIds}, report)

  await Promise.all(Object.entries(boardGameIndex).map(kvp => {
    const boardGameApiId = kvp[0]
    const entry = kvp[1]
    let revisedEntry = performFurtherAnalysis(entry)
    return writeFile(entry.name, `index/${boardGameApiId}.json`, revisedEntry)
  }))

  return writeFile('Board Game Index', 'boardgame-index.json', boardGameIndex)
}

function performFurtherAnalysis (entry) {
  const result = clone(entry)

  const playRecords = result.playRecords
  result.totalGamesPlayed = playRecords.length

  const coOpGames = playRecords.filter(n => (n.coOp + '').toLowerCase().trim() === 'yes')
  result.coOpGamesPlayedCount = coOpGames.length
  result.coOpGamesPlayedPercentage = fmn(result.coOpGamesPlayedCount / result.totalGamesPlayed)
  result.coOpGameWins = coOpGames.filter(n => {
    let outcome = (n.coOpOutcome + '').toLowerCase().trim()
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
  result.winRateHannah = fmn(result.winCountHannah / result.winnableGamesTotal)
  result.winRateJohn = fmn(result.winCountJohn / result.winnableGamesTotal)
  result.winRateOther = fmn(result.winCountOther / result.winnableGamesTotal)
  result.winRateDraw = fmn(result.winCountDraw / result.winnableGamesTotal)
  result.mostWonGames = result.winCountHannah > result.winCountJohn ? 'Hannah' : 'John'
  result.mostWonGames = result.winCountHannah === result.winCountJohn ? 'Draw' : result.mostWonGames

  return result
}

module.exports = start
