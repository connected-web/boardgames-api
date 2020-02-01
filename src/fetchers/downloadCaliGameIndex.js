const spreadsheetId = '19hFCEc7u9hR_JDr9qKvDIawbWXdSzpA8ozFlVgYYil0'
const log = []
const report = (...messages) => log.push(['[Download Cali Game Index]', ...messages].join(' '))

async function downloadData ({ gsjson }, spreadsheetId) {
  try {
    const worksheets = await gsjson({ spreadsheetId, allWorksheets: true })
    report('Downloaded data:', (worksheets + '').length, 'bytes')
    const entries = worksheets.reduce((acc, item) => acc.concat(item), [])
    return entries
  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

function init (model) {
  return async () => {
    model.calisaurus.gameIndex = await downloadData(model.fetchers, spreadsheetId)
    return {
      gameIndex: model.calisaurus.gameIndex,
      log
    }
  }
}

module.exports = init
