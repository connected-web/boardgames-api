const { expect } = require('chai')
const Nightmare = require('nightmare')
const config = require('./helpers/config')
const dreamCatcher = require('./helpers/dreamCatcher')

describe(`Boardgame API Docs Home [${config.name}]`, () => {
  let nightmare
  beforeEach(() => {
    nightmare = Nightmare()
  })

  it(`should render contents using data from /api/endpoints`, async () => {
    const raw = await nightmare
      .goto(`${config.docsUrl}/`)
      .wait(100)
      .evaluate(() => document.querySelector('endpoint > heading > a:first-of-type').textContent)
      .end()
      .catch(dreamCatcher)
    const actual = (raw + '').trim()
    expect(actual).to.equal('GET /api/endpoints')
  }).timeout(10000)
})
