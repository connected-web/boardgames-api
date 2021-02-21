const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Download Cali Play Stats]', ...messages)
const api = require('../')

async function start () {
  const { playstats } = await api.downloadCaliPlaystats()

  const filename = 'cali-playstats.json'
  const body = JSON.stringify(playstats, null, 2)
  report('Total downloaded data:', body.length, 'bytes')
  report('Writing combined data to:', filename, 'Play Stats Items:', playstats.length)
  return write(datapath(filename), body, 'utf8')
}

module.exports = start
