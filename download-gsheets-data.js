const gsjson = require('google-spreadsheet-to-json')
const { write } = require('promise-path')

async function downloadData(spreadsheetId) {
  try {
    const worksheets = await gsjson({ spreadsheetId, allWorksheets: true })
    console.log('Downloaded data:', (worksheets + '').length, 'bytes')
    const entries = worksheets.reduce((acc, item) => acc.concat(item), [])
    write('cali-boardgames.json', JSON.stringify(entries, null, 2), 'utf8')
  }
  catch(ex) {
    console.error('Unable to download data:', ex)
  }
}

downloadData('1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4')
