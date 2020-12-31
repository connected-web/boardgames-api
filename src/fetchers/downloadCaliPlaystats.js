const spreadsheetId2018 = '1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4'
const spreadsheetId2020 = '1FyeEeWPKch4jVoBoD_lB89GbsUPkYTESkfIeknUhyJw'
const spreadsheetId2021 = '1Va-06sfmVq-UFBxWwo6U5v6N9W_lizW5GvgyogQdGQQ'
const log = []
const report = (...messages) => log.push(['[Download Cali Play Stats]', ...messages].join(' '))

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

async function updatePlaystats (model) {
  const combinedData = await Promise.all([
    downloadData(model.fetchers, spreadsheetId2018),
    downloadData(model.fetchers, spreadsheetId2020),
    downloadData(model.fetchers, spreadsheetId2021)
  ])

  return combinedData.reduce((acc, item) => acc.concat(item), [])
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
