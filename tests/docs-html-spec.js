const config = require('./helpers/config')
const { fetch } = require('promise-path')
const { expect } = require('chai')

function createStandardHTMLTests (path) {
  it('should return valid HTML', async () => {
    const body = await fetch(path)
    expect(body).to.contain('<!DOCTYPE html>')
  })

  it('should contain a navigation section', async () => {
    const body = await fetch(path)
    expect(body).to.match(/<nav>/)
    expect(body).to.match(/<a href="\/docs\/">.*<\/a>/)
    expect(body).to.match(/<\/nav>/)
  })

  it('should contain a footer section', async () => {
    const body = await fetch(path)
    expect(body).to.match(/<footer>.*<\/footer>/)
  })
}

describe('/docs/ - Home page', () => {
  const docsPath = `${config.serverPath}/docs/`

  createStandardHTMLTests(docsPath)

  it('should contain a content body that explains the purpose of the page', async () => {
    const body = await fetch(docsPath)
    expect(body).to.contain('To help us keep track of our endpoints, and perhaps for other people to use, we have created these docs for the boardgames API.')
  })
})

describe('/docs/samples - Samples page', () => {
  const docsPath = `${config.serverPath}/docs/samples`

  createStandardHTMLTests(docsPath)

  it('should contain a content body that explains the purpose of the page', async () => {
    const body = await fetch(docsPath)
    expect(body).to.contain('To help you understand the content and context of the API; these samples have been created to provide simplified examples of what the endpoints provide.')
  })
})

describe('/docs/schemas - Schemas Page', () => {
  const docsPath = `${config.serverPath}/docs/schemas`

  createStandardHTMLTests(docsPath)

  it('should contain a content body that explains the purpose of the page', async () => {
    const body = await fetch(docsPath)
    expect(body).to.contain('To help you understand the content and context of the API; these schemas have been created to verify our endpoints and the data they produce.')
  })
})

describe('/docs/404 - 404 page', () => {
  const docsPath = `${config.serverPath}/docs/${(Math.random())}`

  createStandardHTMLTests(docsPath)

  it('should contain a content body that explains the purpose of the page', async () => {
    const body = await fetch(docsPath)
    expect(body).to.contain('404 Not found')
  })
})
