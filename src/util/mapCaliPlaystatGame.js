const reduceNameToBoardGameApiId = require('./reduceNameToBoardGameApiId')
const convertGSheetsDate = require('./convertGSheetsDate')
const report = (...messages) => console.log('[Map Cali Playstat Game]', ...messages)

const expectedPlaystatProperties = ['game', 'date', 'winner', 'coOpOutcome', 'coOp', 'notes', 'gameFamily', 'mechanics']
const playRecordProperties = ['date', 'winner', 'coOpOutcome', 'coOp', 'notes', 'gameFamily', 'noOfPlayers', 'expansions', 'mechanics']

function mapCaliPlaystatGame (accumulator, item) {
  const name = item.game
  if (name) {
    const boardGameApiId = reduceNameToBoardGameApiId(name)
    const entry = accumulator[boardGameApiId] || { boardGameApiId, playRecords: [], name }
    const playRecord = {}
    expectedPlaystatProperties.forEach(key => {
      let value = item[key]
      if (key.toLowerCase().includes('date')) {
        value = convertGSheetsDate(value)
      }

      if (playRecordProperties.includes(key)) {
        playRecord[key] = value
      }
    })
    playRecord.gameFamily = playRecord.gameFamily || item.tags
    entry.playRecords.push(playRecord)
    accumulator[boardGameApiId] = entry
  } else {
    report('No name found on play stat:', JSON.stringify(item))
  }
  return accumulator
}

module.exports = mapCaliPlaystatGame
