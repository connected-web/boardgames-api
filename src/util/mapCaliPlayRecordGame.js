const reduceNameToBoardGameApiId = require('./reduceNameToBoardGameApiId')
const convertDDMMYYYYDate = require('./convertDDMMYYYYDate')
const playRecordProperties = require('./commonPlayRecordProperties')
const report = (...messages) => console.log('[Map Cali Play Record Game]', ...messages)

const expectedPlayrecordProperties = ['name', 'date', 'winner', 'coOpOutcome', 'coOp', 'notes', 'noOfPlayers', 'expansions', 'source']
function mapCaliPlayrecordGame (accumulator, item) {
  const name = item.name
  if (name) {
    const boardGameApiId = reduceNameToBoardGameApiId(name)
    const entry = accumulator[boardGameApiId] || { boardGameApiId, playRecords: [], name }
    const playRecord = {}
    expectedPlayrecordProperties.forEach(key => {
      let value = item[key]
      if (key.toLowerCase().includes('date')) {
        value = convertDDMMYYYYDate(value)
      }

      if (playRecordProperties.includes(key)) {
        playRecord[key] = value
      }
    })
    playRecord.gameFamily = playRecord.gameFamily || item.tags
    entry.playRecords.push(playRecord)
    accumulator[boardGameApiId] = entry
  } else {
    report('No name found on play record:', JSON.stringify(item))
  }
  return accumulator
}

module.exports = mapCaliPlayrecordGame
