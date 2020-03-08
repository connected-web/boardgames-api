const { write, position } = require('promise-path')
const report = (...messages) => console.log('[Write JSON]', ...messages)
const datapath = position(__dirname, '../../data')

function writeJson (description, filename, data) {
  const fileContents = JSON.stringify(data, null, 2)
  report('Writing', description, fileContents.length, 'bytes to', filename)
  return write(datapath(filename), fileContents, 'utf8')
}

module.exports = writeJson
