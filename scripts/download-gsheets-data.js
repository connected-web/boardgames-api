const gsjson = require('google-spreadsheet-to-json')
const { write } = require('promise-path')
const position = require('./helpers/position')(__dirname, '../data')
const spreadsheetId = '1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4'

async function downloadData (spreadsheetId) {
  try {
    const worksheets = await gsjson({ spreadsheetId, allWorksheets: true })
    console.log('[Download GSheets Data] Downloaded data:', (worksheets + '').length, 'bytes')
    const entries = worksheets.reduce((acc, item) => acc.concat(item), [])
    write(position('cali-boardgames.json'), JSON.stringify(entries, null, 2), 'utf8')
  } catch (ex) {
    console.error('[Download GSheets Data] Unable to download data:', ex)
  }
}

async function start () {
  return downloadData(spreadsheetId)
}

module.exports = start
