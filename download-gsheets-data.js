const gsjson = require('google-spreadsheet-to-json')
const { write } = require('promise-path')

async function downloadData(spreadsheetId) {
  try {
    const data = await  gsjson({ spreadsheetId, allWorksheets: true })
    console.log('Downloaded data:', data.length, 'bytes')
    write('cali-boardgames.json', JSON.stringify(data, null, 2), 'utf8')
  }
  catch(ex) {
    console.error('Unable download data', ex.message)
  }
}

downloadData('1WUx5D5gONHukgaHjqLl334fBUQzy6NQiaEouztVp-L4')
