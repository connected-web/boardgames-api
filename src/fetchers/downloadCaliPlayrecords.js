const playrecordSources = [{
  year: 2022,
  apiUser: 'John',
  apiKey: process.env.PLAYRECORD_API_KEY,
  url: 'https://nn58gn0krl.execute-api.eu-west-2.amazonaws.com/Prod/playrecords/list'
}]

const log = []
const report = (...messages) => console.log(['[Download Cali Play Stats]', ...messages].join(' '))

async function downloadPlayrecords ({ axios }, { year, apiUser, apiKey, url }) {
  report('Downloading data for', year, 'from', url, 'with user API key:', apiUser)
  try {
    const axiosConfig = {
      headers: {
        'calisaurus-user': apiUser,
        'calisaurus-user-api-key': apiKey
      }
    }
    const { data } = await axios.get(url, axiosConfig)
    report('Downloaded playrecords from', url)
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
  return playrecords.filter(n => n)
}

function init (model) {
  return async () => {
    model.calisaurus.playrecords = await downloadFromSources(model)
    return {
      playstats: model.calisaurus.playrecords,
      log
    }
  }
}

module.exports = init
