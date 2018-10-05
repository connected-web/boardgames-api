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

  expect(schemaValidation.errors).to.deep.equal([])
}

describe('API Endpoints', () => {
  it('GET /api/ should list all available endpoints', async () => test(`${config.serverPath}/api/`, `${config.serverPath}/api/schema`))
  it('GET /api/ should match the local data used to generate these tests', async () => {
    const actual = await fetchJSON(`${config.serverPath}/api/`)
    const expected = endpointData
    expect(actual).to.deep.equal(expected)
  })

  endpointData.endpoints.forEach((endpoint) => {
    it(`${endpoint.method} ${endpoint.path} should '${endpoint.description}'`, () => test(endpoint.path, endpoint.schema))
  })
})
