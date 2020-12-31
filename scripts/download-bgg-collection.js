const { position, write } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Download Board Game Geek Collection]', ...messages)
const api = require('../')

async function start () {
  try {
    const { collection } = await api.downloadBggCollection()
    const body = JSON.stringify(collection, null, 2)
    const filename = 'bgg-collection.json'
    report('Downloaded', body.length, 'bytes; writing to:', filename)
    if (body.length > 100000) {
      return write(datapath(filename), body, 'utf8')
    } else {
      report('Not writing file; received body too small compared to expected data.', body + '')
      return false
    }
  } catch (ex) {
    report('Error fetching data:', ex, ex.stack)
  }
}

module.exports = start
