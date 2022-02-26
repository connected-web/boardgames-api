const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Download Cali Play Records]', ...messages)
const api = require('../')

async function start () {
  const { playrecords, log } = await api.downloadCaliPlayrecords()

  log.forEach(line => console.log(line))

  const filename = 'cali-playrecords.json'
  const body = JSON.stringify(playrecords, null, 2)
  report('Total downloaded data:', body.length, 'bytes')
  report('Writing combined data to:', filename, 'Play Records:', playrecords.length)
  return write(datapath(filename), body, 'utf8')
}

module.exports = start
