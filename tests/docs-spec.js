const config = require('./helpers/config')
const { fetch } = require('promise-path')
const { expect } = require('chai')

describe('Docs /docs/', () => {
  const docsPath = `${config.serverPath}/docs/`
  it('should return valid HTML', async () => {
    const body = await fetch(docsPath)
    expect(body).to.contain('<!DOCTYPE html>')
  })

  it('should contain a navigation section', async () => {
    const body = await fetch(docsPath)
    expect(body).to.match(/<nav>.*<\/nav>/)
  })

  it('should contain a content body that explains the purpose of the page', async () => {
    const body = await fetch(docsPath)
    expect(body).to.contain('These docs are for the boardgames API')
  })

  it('should contain a footer section', async () => {
    const body = await fetch(docsPath)
    expect(body).to.match(/<footer>.*<\/footer>/)
  })
})