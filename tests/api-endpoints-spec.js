const config = require('./helpers/config')
const { fetch } = require('promise-path')
const { expect } = require('chai')

describe('API Endpoints /api/', () => {
  const apiPath = `${config.serverPath}/api/`
  it('should display of a list of endpoints', async () => {
    const data = JSON.parse(await fetch(apiPath))
    expect(data).to.deep.equal({
      "endpoints": {
        "/": {
          "path": "/",
          "description": "Return a list of endpoints",
          "accepts": "application/json"
        }
      }
    })
  })
})
