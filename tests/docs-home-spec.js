const { expect } = require('chai')
const Nightmare = require('nightmare')
const config = require('./helpers/config')
const screenshotPath = require('./helpers/screenshotPath')
const dreamCatcher = require('./helpers/dreamCatcher')

function box(x, y, width, height) {
  return { x, y, width, height }
}

describe(`Boardgame API Docs Home [${config.name}]`, () => {
  let nightmare
  beforeEach(() => {
    nightmare = Nightmare()
  })

  it(`should render contents using data from /api/endpoints`, async () => {
    const raw = await nightmare
      .goto(`${config.docsUrl}`)
      .wait(100)
      .evaluate(() => document.querySelector('endpoint > heading > a:first-of-type').textContent)
      .end()
      .catch(dreamCatcher)
    const actual = (raw + '').trim()
    expect(actual).to.equal('GET /api/endpoints')
  }).timeout(5000)
})