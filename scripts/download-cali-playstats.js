const gsjson = require('google-spreadsheet-to-json')
const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const spreadsheetId = '1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4'
const report = (...messages) => console.log('[Download Cali Play Stats]', ...messages)

async function downloadData (spreadsheetId) {
  try {
    const worksheets = await gsjson({ spreadsheetId, allWorksheets: true })
    report('Downloaded data:', (worksheets + '').length, 'bytes')
    const entries = worksheets.reduce((acc, item) => acc.concat(item), [])
    const filename = 'cali-playstats.json'
    report('Writing combined data to:', filename)
    write(datapath(filename), JSON.stringify(entries, null, 2), 'utf8')
  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

async function start () {
  return downloadData(spreadsheetId)
}

module.exports = start
