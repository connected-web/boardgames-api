const gsjson = require('google-spreadsheet-to-json')
const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const spreadsheetId = '1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4'
const spreadsheetId2020 = '1FyeEeWPKch4jVoBoD_lB89GbsUPkYTESkfIeknUhyJw'
const report = (...messages) => console.log('[Download Cali Play Stats]', ...messages)

async function downloadData (filename, spreadsheetId) {
  try {
    const worksheets = await gsjson({ spreadsheetId, allWorksheets: true })
    report('Downloaded data:', (worksheets + '').length, 'bytes')
    const entries = worksheets.reduce((acc, item) => acc.concat(item), [])
    report('Writing combined data to:', filename)
    return write(datapath(filename), JSON.stringify(entries, null, 2), 'utf8')
  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

async function start () {
  await downloadData('cali-playstats.json', spreadsheetId)
  await downloadData('cali-playstats-2020.json', spreadsheetId2020)
}

module.exports = start
