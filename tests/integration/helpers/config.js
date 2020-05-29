const path = require('path')
const devServerPath = 'http://localhost:4000'

const devEnvironment = {
  serverPath: devServerPath,
  name: 'Dev',
  docsUrl: `${devServerPath}/docs`
}

let server
before(() => {
  console.log('Opening test server', devServerPath)
  server = require(path.join(__dirname, '../../../test-server'))
})

after(() => {
  console.log('Closing test server', devServerPath)
  setTimeout(() => {
    server.close()
  }, 50)
})

module.exports = devEnvironment
