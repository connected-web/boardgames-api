const gsjson = require('google-spreadsheet-to-json')
const spreadsheetId2018 = '1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4'
const spreadsheetId2020 = '1FyeEeWPKch4jVoBoD_lB89GbsUPkYTESkfIeknUhyJw'
const log = []
const report = (...messages) => log.push(['[Download Cali Play Stats]', ...messages].join(' '))

async function downloadData (spreadsheetId) {
  try {
    const worksheets = await gsjson({ spreadsheetId, allWorksheets: true })
    report('Downloaded data:', (worksheets + '').length, 'bytes')
    const entries = worksheets.reduce((acc, item) => acc.concat(item), [])
    return entries
  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

async function updatePlaystats () {
  const combinedData = await Promise.all([
    downloadData(spreadsheetId2018),
    downloadData(spreadsheetId2020)
  ])

  return combinedData.reduce((acc, item) => acc.concat(item), [])
}

function init (model) {
  return async () => {
    model.caliPlaystats = await updatePlaystats()
    return {
      playstats: model.caliPlaystats,
      log
    }
  }
}

module.exports = init
