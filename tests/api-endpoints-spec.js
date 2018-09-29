const config = require('./helpers/config')
const { fetch } = require('promise-path')
const { expect } = require('chai')
const { validate } = require('jsonschema')

describe('API Endpoints /api/', () => {
  const apiPath = `${config.serverPath}/api/`
  const apiSchema = require('../api/schemas/endpoints-schema.json')
  it('should display of a list of endpoints', async () => {
    const data = JSON.parse(await fetch(apiPath))
    const schemaValidation = validate(data, apiSchema)
    expect(schemaValidation.errors).to.deep.equal([])
  })
})
