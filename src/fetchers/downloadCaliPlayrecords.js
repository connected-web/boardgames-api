/* global btoa */
const axios = require('axios')
const { find, read } = require('promise-path')

async function getOAuthToken () {
  const {
    CONNECTED_WEB_PROD_SSO_CLIENT_ID,
    CONNECTED_WEB_PROD_SSO_SECRET
  } = process.env

  const clientConfig = {
    clientId: CONNECTED_WEB_PROD_SSO_CLIENT_ID,
    clientSecret: CONNECTED_WEB_PROD_SSO_SECRET,
    oauthTokenEndpoint: 'https://connected-web.auth.eu-west-2.amazoncognito.com/oauth2/token'
  }

  const { clientId, clientSecret, oauthTokenEndpoint } = clientConfig

  const requestPayload = [
    'grant_type=client_credentials',
    `client_id=${clientId}`
  ].join('&')
  const requestHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${btoa([clientId, clientSecret].join(':'))}`
  }
  const tokenResponse = await axios.post(oauthTokenEndpoint, requestPayload, { headers: requestHeaders })
  return tokenResponse?.data?.access_token ?? 'not-set'
}

async function createPlayRecordSources () {
  return [{
    year: 2022,
    authToken: await getOAuthToken(),
    url: 'https://boardgames-api.prod.connected-web.services/playrecords/list'
  }]
}

const log = []
const report = (...messages) => log.push(['[Download Cali Play Records]', ...messages].join(' '))

async function downloadPlayrecords ({ axios }, { year, authToken, url }) {
  const startTime = new Date().getTime()
  report('Downloading data for', year, 'from', url, 'with App authKey (', authToken?.length ?? 0, 'bytes )')
  try {
    const axiosConfig = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
    const { data } = await axios.get(url, axiosConfig)
    const endTime = new Date().getTime()
    const executionTime = endTime - startTime
    report('Downloaded playrecords from', url, 'Result:', JSON.stringify(data), 'Time taken:', executionTime, 'ms')
    return data?.playRecords || []
  } catch (ex) {
    report('Unable to download playrecord data:', ex)
    return []
  }
}

async function downloadFromSources (model) {
  const { fetchers } = model
  const playRecordSources = await createPlayRecordSources()
  const downloadWork = playRecordSources.map(source => {
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
