/* global btoa */
import axios from 'axios'

const {
  CONNECTED_WEB_DEV_SSO_CLIENT_ID,
  CONNECTED_WEB_DEV_SSO_SECRET,
  CONNECTED_WEB_PROD_SSO_CLIENT_ID,
  CONNECTED_WEB_PROD_SSO_SECRET
} = process.env

const argv = process.argv

let mode = 'not-set'
mode = argv.includes('--dev') ? 'dev' : mode
mode = argv.includes('--prod') ? 'prod' : mode

const clientConfigs = {
  'not-set': {
    error: 'No mode set; use --dev or --prod to specify credentials realm'
  },
  'dev': {
    clientId: CONNECTED_WEB_DEV_SSO_CLIENT_ID,
    clientSecret: CONNECTED_WEB_DEV_SSO_SECRET,
    oauthTokenEndpoint: 'https://connected-web-dev.auth.eu-west-2.amazoncognito.com/oauth2/token'
  },
  'prod': {
    clientId: CONNECTED_WEB_PROD_SSO_CLIENT_ID,
    clientSecret: CONNECTED_WEB_PROD_SSO_SECRET,
    oauthTokenEndpoint: 'https://connected-web.auth.eu-west-2.amazoncognito.com/oauth2/token'
  }
}

const clientConfig = clientConfigs[mode]

async function getOAuthToken () {
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
  // console.log('[getOAuthToken] Token response', { tokenResponse: tokenResponse.data })
  return tokenResponse?.data?.access_token ?? 'not-set'
}

async function run () {
  if (clientConfig.error) {
    console.error({ error: clientConfig.error })
    process.exit(1)
  }

  try {
    const result = await getOAuthToken()
    // console.log('Result:', { result })
    process.stdout.write(result)
  } catch (ex) {
    console.error({ response: ex?.response?.data, payload: ex?.config?.data })
    console.error('Error:', { message: ex.message })
    process.exit(2)
  }
}

run()
