const config = require('./helpers/config')
const { fetch, position } = require('promise-path')
const { expect } = require('chai')
const { validate } = require('jsonschema')

const apiPath = position(__dirname, '../api/')
const endpointData = require(apiPath('endpoints.json'))

async function fetchJSON(url) {
  let body
  try {
    body = await fetch(url)
    return JSON.parse(body)
  } catch(ex) {
    throw new Error(`Unable to parse body as valid JSON: ${body}, ${ex}`)
  }
}

function checkForRelativeUrl(path) {
  if (path && path.substring(0, 1) === '/') {
    return config.serverPath + path
  }
  return path
}

async function test(apiPath, apiSchemaPath) {
  apiPath = checkForRelativeUrl(apiPath)
  apiSchemaPath = checkForRelativeUrl(apiSchemaPath)

  const apiSchema = await fetchJSON(apiSchemaPath)
  const endpointData = await fetchJSON(apiPath)
  const schemaValidation = validate(endpointData, apiSchema)

  expect(endpointData).to.not.have.property('status', '404');
  expect(schemaValidation.errors).to.deep.equal([])
}

describe('API Endpoints', () => {
  it('GET /api/endpoints should list all available endpoints', async () => test(`${config.serverPath}/api/endpoints`, `${config.serverPath}/api/schema`))
  it('GET /api/endpoints should match the local data used to generate these tests', async () => {
    const actual = await fetchJSON(`${config.serverPath}/api/endpoints`)
    const actualEndpoints = actual && actual.endpoints || []
    endpointData.endpoints.forEach((expectedEndpoint, i) => {
      expect(actualEndpoints[i]).to.deep.equal(expectedEndpoint)
    })
  })

  endpointData.endpoints.forEach((endpoint) => {
    const testPath = endpoint.example || endpoint.path
    it(`${endpoint.method} ${testPath} should '${endpoint.description}'`, async () => test(testPath, endpoint.schema))
    it(`${endpoint.method} ${testPath}/schema should provide a valid schema`, async () => test(`${testPath}/schema`, 'https://json-schema.org/draft-07/schema'))
    it(`${endpoint.method} ${testPath}/sample should provide a valid sample`, async () => test(`${testPath}/sample`, endpoint.schema))
  })
})
