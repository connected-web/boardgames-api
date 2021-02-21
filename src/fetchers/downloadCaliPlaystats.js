const readCredentials = require('../util/readCredentials')
const spreadsheets = [{
  year: 2018,
  id: '1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4'
}, {
  year: 2020,
  id: '1FyeEeWPKch4jVoBoD_lB89GbsUPkYTESkfIeknUhyJw'
}, {
  year: 2021,
  id: '1Va-06sfmVq-UFBxWwo6U5v6N9W_lizW5GvgyogQdGQQ'
}]

const log = []
const report = (...messages) => console.log(['[Download Cali Play Stats]', ...messages].join(' '))

async function downloadData ({ gsjson }, { year, id }) {
  report('Downloading data for', year, 'using id:', id)
  const spreadsheetId = id
  try {
    const credentials = await readCredentials()
    const worksheets = await gsjson({ spreadsheetId, allWorksheets: true, credentials })
    report('Downloaded data:', (worksheets + '').length, 'bytes')
    const cells = worksheets.reduce((acc, item) => acc.concat(item), [])
    report(year, 'cells', cells.length)
    return cells
  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

async function updatePlaystats (model) {
  const { fetchers } = model
  const asyncWork = spreadsheets.map(spreadsheet => {
    return downloadData(fetchers, spreadsheet)
  })
  const combinedData = await Promise.all(asyncWork)

  const playStats = combinedData.reduce((acc, item) => acc.concat(item), [])
  return playStats.filter(n => n)
}

function init (model) {
  return async () => {
    model.calisaurus.playstats = await updatePlaystats(model)
    return {
      playstats: model.calisaurus.playstats,
      log
    }
  }
}

module.exports = init
