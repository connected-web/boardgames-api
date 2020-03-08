const { position, read } = require('promise-path')
const report = (...messages) => console.log('[Read JSON]', ...messages)
const datapath = position(__dirname, '../../data')

async function readJson (filename) {
  const location = datapath(filename)
  const contents = await read(location)
  try {
    const data = JSON.parse(contents)
    return data
  } catch (ex) {
    report('Unable to read JSON data from', location, ex, (contents + '').substring(0, 200), '...')
    return false
  }
}

module.exports = readJson
