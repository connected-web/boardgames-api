const config = require('./helpers/config')
const { fetch } = require('promise-path')
const { expect } = require('chai')

describe('/ - Redirect to /docs/', () => {
  it('should redirect to /docs/', async () => {
    const body = await fetch(config.serverPath)
    expect(body).to.contain('<script type="text/javascript">window.location = "/docs/"</script>')
  })
})
