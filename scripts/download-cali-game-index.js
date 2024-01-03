const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Download Cali Game Index]', ...messages)
const api = require('../')

async function start () {
  try {
    const { gameIndex } = await api.downloadCaliGameIndex()
    const body = JSON.stringify(gameIndex, null, 2)
    report('Downloaded data:', body.length, 'bytes')
    if (body.length < 100) {
      report(`Data too small - aborting: Body: ${body}`)
      return
    }
    const filename = 'cali-game-index.json'
    report('Writing combined data to:', filename, 'Game Index Items:', gameIndex.length)
    write(datapath(filename), body, 'utf8')
  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

module.exports = start
