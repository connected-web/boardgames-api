const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Download Cali Game Index]', ...messages)
const api = require('../')

async function start () {
  try {
    const { gameIndex } = await api.downloadCaliGameIndex()
    const body = JSON.stringify(gameIndex, null, 2)
    report('Downloaded data:', body.length, 'bytes')
    const filename = 'cali-game-index.json'
    report('Writing combined data to:', filename)
    write(datapath(filename), body, 'utf8')
  } catch (ex) {
    report('Unable to download data:', ex)
  }
}

module.exports = start
