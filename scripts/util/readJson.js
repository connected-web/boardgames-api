const { read } = require('promise-path')
async function readJson (path) {
  const contents = await read(path)
  try {
    const data = JSON.parse(contents)
    return data
  } catch (ex) {
    console.warn('Unable to read JSON data from', path, ex, (contents + '').substring(0, 200), '...')
    return false
  }
}

module.exports = readJson
