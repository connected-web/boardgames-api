const { find, read } = require('promise-path')

const playrecordSources = [{
  year: 2022,
  apiUser: process.env.PLAYRECORD_API_USER || 'John',
  apiKey: process.env.PLAYRECORD_API_KEY,
  url: 'https://nn58gn0krl.execute-api.eu-west-2.amazonaws.com/Prod/playrecords/list'
}]

const log = []
const report = (...messages) => log.push(['[Download Cali Play Records]', ...messages].join(' '))

async function downloadPlayrecords ({ axios }, { year, apiUser, apiKey, url }) {
  report('Downloading data for', year, 'from', url, 'with user API key:', apiUser, apiKey)
  try {
    const axiosConfig = {
      headers: {
        'calisaurus-user': apiUser,
        'calisaurus-user-api-key': apiKey
      }
    }
    const { data } = await axios.get(url, axiosConfig)
    report('Downloaded playrecords from', url, JSON.stringify(data))
    return data?.playRecords || []
  } catch (ex) {
    report('Unable to download playrecord data:', ex)
    return []
  }
}
async function downloadFromSources (model) {
  const { fetchers } = model
  const downloadWork = await playrecordSources.map(source => {
    return downloadPlayrecords(fetchers, source)
  })
  const combinedData = await Promise.all(downloadWork)

  const playrecords = combinedData.flat()
  const nonEmptyRecords = playrecords.filter(n => n)

  if (nonEmptyRecords.length === 0) {
    report('No play records found - using local backup data.')
    const files = await find('./data/boardgames-tracking/**/*.json')
    report('Found backup files:', files?.length)
    report('Backup start:', '\n' + files.slice(0, 3).join('\n'))
    report('...')
    report('Backup end:', '\n' + files.slice(-3).join('\n'))
    const work = files.map(file => read(file, 'utf8').then(JSON.parse))
    return await Promise.all(work)
  } else {
    return nonEmptyRecords
  }
}

function init (model) {
  return async () => {
    model.calisaurus.playrecords = await downloadFromSources(model)
    return {
      playrecords: model.calisaurus.playrecords,
      log
    }
  }
}

module.exports = init
