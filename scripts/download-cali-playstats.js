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
    return entries

  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

async function start () {
  const combinedData = await Promise.all([
    downloadData('cali-playstats.json', spreadsheetId),
    downloadData('cali-playstats-2020.json', spreadsheetId2020)
  ])
  const flattenedData = combinedData.reduce((acc, item) => acc.concat(item), [])

  const filename = 'cali-playstats.json'
  report('Writing combined data to:', filename)
  return write(datapath(filename), JSON.stringify(flattenedData, null, 2), 'utf8')
}

module.exports = start
