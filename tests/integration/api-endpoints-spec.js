const config = require('./helpers/config')
const { fetch, position, write } = require('promise-path')
const { expect } = require('chai')
const { validate } = require('jsonschema')

const apiPath = position(__dirname, '../../api/')
const schemaErrorsPath = position(__dirname, 'schema-errors')
const endpointData = require(apiPath('endpoints.json'))

async function fetchJSON (url) {
  let body
  try {
    body = await fetch(url)
    return JSON.parse(body)
  } catch (ex) {
    throw new Error(`Unable to parse body as valid JSON: ${body}, ${ex}`)
  }
}

function checkForRelativeUrl (path) {
  if (path && path.substring(0, 1) === '/') {
    return config.serverPath + path
  }
  return path
}

async function test (apiPath, apiSchemaPath) {
  apiPath = checkForRelativeUrl(apiPath)
  apiSchemaPath = checkForRelativeUrl(apiSchemaPath)

  const apiSchema = await fetchJSON(apiSchemaPath)
  const endpointData = await fetchJSON(apiPath)
  const schemaValidation = validate(endpointData, apiSchema)

  expect(endpointData).to.not.have.property('status', '404')
  try {
    expect(schemaValidation.schema).to.not.have.property('status', '404')
  } catch (ex) {
    console.log('Schema validation:', schemaValidation)
    expect(schemaValidation.schema).to.not.have.property('status', '404')
  }

  if (schemaValidation.errors.length > 0) {
    const schemaErrorsFilePath = schemaErrorsPath(apiPath.replace(/\//g, '-') + '.json')
    await write(schemaErrorsFilePath, JSON.stringify(schemaValidation.errors, null, 2), 'utf8')
  }

  expect(schemaValidation.errors.map(error => error.message)).to.deep.equal([])
}

describe('API Endpoints', () => {
  it('GET /api/endpoints should list all available endpoints', async () => test(`${config.serverPath}/api/endpoints`, `${config.serverPath}/api/endpoints/schema`))
  it('GET /api/endpoints should match the local data used to generate these tests', async () => {
    const actual = await fetchJSON(`${config.serverPath}/api/endpoints`)
    const actualEndpoints = (actual && actual.endpoints) || []
    endpointData.endpoints.forEach((expectedEndpoint, i) => {
      expect(actualEndpoints[i]).to.deep.equal(expectedEndpoint)
    })
  })

  endpointData.endpoints.forEach((endpoint) => {
    if (endpoint !== '/api/boardgame/grids/byYear/2018/sample') {
      // return
    }

    describe(`${endpoint.method} ${endpoint.description}`, () => {
      const testPath = endpoint.example || endpoint.path
      if (endpoint.example) {
        it(`${endpoint.method} ${endpoint.example} should '${endpoint.description}'`, async () => test(endpoint.example, endpoint.schema))
      } else {
        it(`${endpoint.method} ${testPath} should '${endpoint.description}'`, async () => test(testPath, endpoint.schema))
      }

      it(`${endpoint.method} ${testPath}/schema should provide a valid schema`, async () => test(`${testPath}/schema`, 'https://json-schema.org/draft-07/schema'))
      it(`${endpoint.method} ${testPath}/sample should provide a valid sample`, async () => test(`${testPath}/sample`, endpoint.schema))
    })
  })
})
