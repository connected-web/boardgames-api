const config = require('./helpers/config')
const { fetch } = require('promise-path')
const { expect } = require('chai')
const { validate } = require('jsonschema')

const schemaSchemaUrl = 'https://json-schema.org/draft-07/schema'

async function fetchJSON(url) {
  let body
  try {
    body = await fetch(url)
    return JSON.parse(body)
  } catch(ex) {
    throw new Error(`Unable to parse body as valid JSON: ${body}, ${ex}`)
  }
}

async function test(apiPath, apiSchemaPath) {
  apiSchemaPath = apiSchemaPath || `${apiPath}/schema`.replace('/api//', '/api/')

  const apiSchema = await fetchJSON(apiSchemaPath)
  const endpointData = await fetchJSON(apiPath)
  const schemaValidation = validate(endpointData, apiSchema)

  expect(schemaValidation.errors).to.deep.equal([])
}

describe('API Endpoints /api/', async () => {
  it('should list all available endpoints',
    async () => test(`${config.serverPath}/api/`))
  it('should provide a valid schema, for validating the /api/ endpoint',
    async () => test(`${config.serverPath}/api/schema`, schemaSchemaUrl))
  it('should provide a board game feed',
    async () => test(`${config.serverPath}/api/boardgame/feed`))
  it('should provide a valid schema, for validating the /api/boardgame/feed endpoint',
    async () => test(`${config.serverPath}/api/boardgame/feed/schema`, schemaSchemaUrl))

})
