/* global btoa */
import axios from 'axios'

const {
  CONNECTED_WEB_DEV_SSO_CLIENT_ID,
  CONNECTED_WEB_DEV_SSO_SECRET
} = process.env

async function getOAuthToken () {
  const oauthTokenEndpoint = 'https://connected-web-dev.auth.eu-west-2.amazoncognito.com/oauth2/token'
  const clientId = CONNECTED_WEB_DEV_SSO_CLIENT_ID
  const clientSecret = CONNECTED_WEB_DEV_SSO_SECRET
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
  console.log('[getOAuthToken] Token response', { tokenResponse: tokenResponse.data })
  return tokenResponse?.data?.access_token ?? 'not-set'
}

async function run () {
  try {
    const result = await getOAuthToken()
    console.log('Result:', { result })
  } catch (ex) {
    console.error({ response: ex?.response?.data, payload: ex?.config?.data })
    console.error('Error:', { message: ex.message })
  }
}

run()
