import axios from 'axios'
import OpenAPIClientAxios, { Document } from 'openapi-client-axios'
import { Client as BoardGamesAPIClient } from './api-client'

import fs from 'node:fs/promises'
import path from 'node:path'

import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

const {
  POST_DEPLOYMENT_SERVER_DOMAIN,
  POST_DEPLOYMENT_AUTH_URL,
  POST_DEPLOYMENT_CLIENT_ID,
  POST_DEPLOYMENT_CLIENT_SECRET,
  CONNECTED_WEB_DEV_SSO_CLIENT_ID,
  CONNECTED_WEB_DEV_SSO_SECRET,
  CONNECTED_WEB_PROD_SSO_CLIENT_ID,
  CONNECTED_WEB_PROD_SSO_SECRET
} = process.env

interface ServerInfo {
  baseURL: string
  headers: {
    [param: string]: string
  }
}

const clientConfigs = {
  'not-set': {
    error: 'No mode set; use --dev or --prod to specify credentials realm'
  },
  dev: {
    clientId: CONNECTED_WEB_DEV_SSO_CLIENT_ID as string,
    clientSecret: CONNECTED_WEB_DEV_SSO_SECRET as string,
    oauthTokenEndpoint: 'https://connected-web-dev.auth.eu-west-2.amazoncognito.com/oauth2/token',
    serviceUnderTest: 'https://boardgames-api.dev.connected-web.services'
  },
  prod: {
    clientId: CONNECTED_WEB_PROD_SSO_CLIENT_ID as string,
    clientSecret: CONNECTED_WEB_PROD_SSO_SECRET as string,
    oauthTokenEndpoint: 'https://connected-web.auth.eu-west-2.amazoncognito.com/oauth2/token',
    serviceUnderTest: 'https://boardgames-api.prod.connected-web.services'
  },
  ci: {
    clientId: POST_DEPLOYMENT_CLIENT_ID as string,
    clientSecret: POST_DEPLOYMENT_CLIENT_SECRET as string,
    oauthTokenEndpoint: POST_DEPLOYMENT_AUTH_URL as string,
    serviceUnderTest: POST_DEPLOYMENT_SERVER_DOMAIN as string
  }
}

const clientConfig = POST_DEPLOYMENT_AUTH_URL !== undefined ? clientConfigs.ci : clientConfigs.dev
console.log('Using client config:', { clientConfig })
const serverConfig: ServerInfo = {
  baseURL: clientConfig.serviceUnderTest,
  headers: {
    authorization: 'Bearer not-specified',
    'content-type': 'application/json'
  }
}

async function getOAuthToken (): Promise<string> {
  const { clientId, clientSecret, oauthTokenEndpoint } = clientConfig
  const requestPayload = [
    'grant_type=client_credentials',
    `client_id=${clientId}`
  ].join('&')
  const requestHeaders = {
    accept: 'application/json',
    'content-type': 'application/x-www-form-urlencoded',
    authorization: `Basic ${btoa([clientId, clientSecret].join(':'))}`
  }
  const tokenResponse = await axios.post(oauthTokenEndpoint, requestPayload, { headers: requestHeaders })
  // console.log('[getOAuthToken] Token response', { tokenResponse: tokenResponse.data })
  return tokenResponse?.data?.access_token ?? 'not-set'
}

describe('Open API Spec', () => {
  let openapiDoc: Document
  const downloadedOpenAPIDocPath = path.join(__dirname, './downloaded-app-openapi.json')

  console.log('Server:', { serverConfig })

  beforeAll(async () => {
    console.log('Implicit test: it should download the openapi spec for the App Store from /openapi')
    const oauthToken = await getOAuthToken()
    console.log('Received OAuth Token:', { oauthToken })
    serverConfig.headers.authorization = `Bearer ${oauthToken}`
    const basicClient = axios.create(serverConfig)
    console.log('Created basic Axios client using:', { serverConfig })

    const response = await basicClient.get('/openapi')
    openapiDoc = response.data
    const fileBody = JSON.stringify(openapiDoc, null, 2)
    await fs.writeFile(downloadedOpenAPIDocPath, fileBody, 'utf-8')
    console.log('Downloaded Open API Spec from /openapi endpoint:', { bytes: fileBody.length }, 'to', downloadedOpenAPIDocPath)
    ajv.addSchema(openapiDoc, 'app-openapi.json')
  })

  describe('Open API Document', () => {
    it('should contain an info block with title and description', async () => {
      const { version, ...testableProps } = openapiDoc.info
      expect(testableProps).toEqual({
        title: 'Board Games API',
        description: 'Board Games API - https://github.com/connected-web/boardgames-api/'
      })
    })

    it('should contain a list of paths', async () => {
      const pathStrings = Object.keys(openapiDoc.paths as any).sort()
      expect(pathStrings).toEqual([
        '/',
        '/hello',
        '/hello/{name}',
        '/openapi',
        '/playrecords',
        '/playrecords/create',
        '/playrecords/delete',
        '/playrecords/list',
        '/playrecords/list/{dateCode}',
        '/status'
      ])
    })

    it('should be possible to create an Open API Client based on the spec', async () => {
      // Note: this requires a manual run of: npm run typegen:for-post-deployment
      // Which uses the openapi-client-axios-typegen package to create appStore-client.d.ts
      const axiosApi = new OpenAPIClientAxios({ definition: openapiDoc, axiosConfigDefaults: { headers: serverConfig.headers } })
      const appStoreClient = await axiosApi.getClient()
      const actualClientKeys = Object.keys(appStoreClient)
      expect(actualClientKeys).toEqual(
        expect.arrayContaining([
          'getOpenAPISpec',
          'getStatus',
          'helloWorld',
          'listPlayRecords',
          'listPlayRecordsByDate',
          'createPlayRecord',
          'deletePlayRecord'
        ])
      )
    })
  })

  describe('OpenAPI Template App Client', () => {
    let appClient: BoardGamesAPIClient
    beforeAll(async () => {
      const axiosApi = new OpenAPIClientAxios({
        definition: openapiDoc,
        axiosConfigDefaults: {
          headers: serverConfig.headers,
          validateStatus: function (status) {
            return status >= 200 // don't throw errors on non-200 codes
          }
        }
      })

      appClient = await axiosApi.getClient<BoardGamesAPIClient>()
      appClient.interceptors.response.use((response) => response, (error) => {
        console.log('Caught client error:', error.message)
      })
    })

    it('should be possible to getOpenAPISpec', async () => {
      const response = await appClient.getOpenAPISpec()

      console.log('Get Open API Spec:', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/OpenAPISpecModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])
    })

    it('should be possible to getStatus', async () => {
      const response = await appClient.getStatus()

      console.log('Get Status:', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/StatusModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])
    })

    it('should be possible to helloWorld', async () => {
      const response = await appClient.helloWorld({ name: 'Andy' })

      console.log('Hello World:', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/MessageResponseModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])

      expect(response.data).toEqual({
        message: 'Hi Andy, have a sunny day~ ☀️⛅☁️🌧️⛈️🌩️!'
      })
    })

    it('should be possible to list play records for 2023-01', async () => {
      const response = await appClient.listPlayRecordsByDate({ dateCode: '2023-01' })

      console.log('Play Records (2023-01):', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      const tempData = response.data as any
      const record = (tempData?.playRecords ?? []).find((item: any) => item.key === 'playrecords/2023/01/2023-01-01T20:16:30.573Z.json')
      expect(record).toEqual({
        name: 'Love Letter: Princess Princess Ever After',
        date: '01/01/2023',
        coOp: 'no',
        noOfPlayers: 2,
        winner: 'Hannah',
        key: 'playrecords/2023/01/2023-01-01T20:16:30.573Z.json'
      })

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/PlayRecordsModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])
    })

    it('should be possible to list play records for 2023', async () => {
      const response = await appClient.listPlayRecordsByDate({ dateCode: '2023' })

      console.log('Play Records (2023):', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/PlayRecordsModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])

      const tempData = response.data as any
      const record = (tempData?.playRecords ?? []).find((item: any) => item.key === 'playrecords/2023/01/2023-01-31T14:37:42.955Z.json')
      expect(record).toEqual({
        name: 'Design Town',
        date: '30/01/2023',
        coOp: 'no',
        noOfPlayers: 2,
        winner: 'Hannah',
        key: 'playrecords/2023/01/2023-01-31T14:37:42.955Z.json'
      })
    })

    it('should be possible to list play records for all time', async () => {
      const response = await appClient.listPlayRecords()

      console.log('Play Records (All Time):', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/PlayRecordsModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])

      const tempData = response.data as any
      const record = (tempData?.playRecords ?? []).find((item: any) => item.key === 'playrecords/2023/01/2023-01-31T14:37:29.851Z.json')
      expect(record).toEqual({
        name: 'Codenames',
        date: '29/01/2023',
        coOp: 'yes',
        noOfPlayers: 2,
        coOpOutcome: 'win',
        key: 'playrecords/2023/01/2023-01-31T14:37:29.851Z.json'
      })
    })

    it('should be possible create a play record', async () => {
      const now = new Date()
      const payload = {
        name: `John Testing (${now.getTime()})`,
        date: '05/03/2031',
        coOp: 'no',
        noOfPlayers: 2,
        winner: 'John',
        expansions: [
          'Fluffy hair John'
        ],
        notes: 'Hair was fluffed!'
      }
      const createPlayRecordResponse = await appClient.createPlayRecord(null, payload)
      const fileKey = createPlayRecordResponse?.data?.keypath

      console.log('Create Play Record:', createPlayRecordResponse.status, createPlayRecordResponse.statusText, JSON.stringify(createPlayRecordResponse.data, null, 2))

      // ajv.validate({ $ref: 'app-openapi.json#/components/schemas/PlayRecord' }, response.data)
      // expect(ajv.errors ?? []).toEqual([])

      const playRecordsResponse = await appClient.listPlayRecordsByDate({ dateCode: '2031-03' })
      console.log('Create Play Record - List Records from 2031-03:', playRecordsResponse.status, playRecordsResponse.statusText, JSON.stringify(playRecordsResponse.data, null, 2))

      const tempData = playRecordsResponse.data as any

      console.log('List of play records after create play record:', { playRecords: tempData.playRecords })

      const record = (tempData?.playRecords ?? []).find((item: any) => item.key === fileKey)
      delete record.key
      expect(record).toEqual(payload)
    })
  })
})
