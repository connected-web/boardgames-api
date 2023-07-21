import axios from 'axios'
import OpenAPIClientAxios, { Document, OpenAPIClient } from 'openapi-client-axios'

import fs from 'node:fs/promises'
import path from 'node:path'

import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

interface ServerInfo {
  baseUrl: string
  headers: {
    [param: string]: string
  }
}

const server: ServerInfo = {
  baseUrl: process.env.POST_DEPLOYMENT_SERVER_DOMAIN ?? 'https://boardgames-api.dev.connected-web.services',
  headers: {
    Authorization: `Bearer ${process.env.POST_DEPLOYMENT_BEARER_TOKEN as string}`
  }
}

describe('Open API Spec', () => {
  let openapiDoc: Document
  const downloadedOpenAPIDocPath = path.join(__dirname, './downloaded-app-openapi.json')

  console.log('Server:', { server })

  beforeAll(async () => {
    console.log('Implicit test: it should download the openapi spec for the App Store from /openapi')
    const basicClient = axios.create({
      baseURL: server.baseUrl,
      headers: server.headers
    })
    console.log('Created basic Axios client using:', { baseUrl: server.baseUrl })

    const response = await basicClient.get('/openapi')
    openapiDoc = response.data
    const fileBody = JSON.stringify(openapiDoc, null, 2)
    await fs.writeFile(downloadedOpenAPIDocPath, fileBody, 'utf-8')
    console.log('Downloaded Open API Spec from /openapi endpoint:', { bytes: fileBody.length }, 'to', downloadedOpenAPIDocPath)
    ajv.addSchema(openapiDoc, 'app-openapi.json')
  })

  it('should contain an info block with title and description', async () => {
    const { version, ...testableProps } = openapiDoc.info
    expect(testableProps).toEqual({
      title: 'OpenAPI Template App API',
      description: 'OpenAPI Template App API - part of the OpenAPI Apps Platform'
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
      '/status'
    ])
  })

  it('should be possible to create an Open API Client based on the spec', async () => {
    // Note: this requires a manual run of: npm run typegen:for-post-deployment
    // Which uses the openapi-client-axios-typegen package to create appStore-client.d.ts
    const axiosApi = new OpenAPIClientAxios({ definition: openapiDoc, axiosConfigDefaults: { headers: server.headers } })
    const appStoreClient = await axiosApi.getClient()
    const actualClientKeys = Object.keys(appStoreClient)
    expect(actualClientKeys).toEqual(
      expect.arrayContaining([
        'getOpenAPISpec',
        'getStatus',
        'helloWorld'
      ])
    )
  })

  describe('OpenAPI Template App Client', () => {
    let appClient: OpenAPIClient
    beforeAll(async () => {
      const axiosApi = new OpenAPIClientAxios({
        definition: openapiDoc,
        axiosConfigDefaults: {
          headers: server.headers,
          validateStatus: function (status) {
            return status >= 200 // don't throw errors on non-200 codes
          }
        }
      })

      appClient = await axiosApi.getClient()
      appClient.interceptors.response.use((response) => response, (error) => {
        console.log('Caught client error:', error.message)
      })
    })

    it('should be possible to getOpenAPISpec', async () => {
      const response = await appClient.getOpenAPISpec()

      console.log('Get Open API Spec:', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/BasicObjectModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])
    })

    it('should be possible to getStatus', async () => {
      const response = await appClient.getStatus()

      console.log('Get Status:', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/BasicObjectModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])
    })

    it('should be possible to helloWorld', async () => {
      const response = await appClient.helloWorld({ name: 'Andy' })

      console.log('Hello World:', response.status, response.statusText, JSON.stringify(response.data, null, 2))

      ajv.validate({ $ref: 'app-openapi.json#/components/schemas/AppMessageModel' }, response.data)
      expect(ajv.errors ?? []).toEqual([])

      expect(response.data).toEqual({
        message: 'Hello Andy! I hope you have a sunny day :)'
      })
    })
  })
})
