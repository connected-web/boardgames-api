const Nightmare = require('nightmare')
const config = require('./helpers/config')
const screenshotPath = require('./helpers/screenshotPath')
const dreamCatcher = require('./helpers/dreamCatcher')

describe(`Boardgame API Docs Screenshots [${config.name}]`, () => {
  it(`should render a mobile view of the documentation website`, () => {
    return Nightmare({width: 411, height: 731})
      .goto(`${config.docsUrl}/`)
      .wait(100)
      .screenshot(screenshotPath('mobile-screen'))
      .end()
      .catch(dreamCatcher)
  }).timeout(5000)

  it(`should render a small screen view of the documentation website`, () => {
    return Nightmare({width: 800, height: 600})
      .goto(`${config.docsUrl}/`)
      .wait(100)
      .screenshot(screenshotPath('small-screen'))
      .end()
      .catch(dreamCatcher)
  }).timeout(5000)

  it(`should render a large screen view of the documentation website`, () => {
    return Nightmare({width: 1920, height: 1080})
      .goto(`${config.docsUrl}/`)
      .wait(100)
      .screenshot(screenshotPath('large-screen'))
      .end()
      .catch(dreamCatcher)
  }).timeout(5000)
})
