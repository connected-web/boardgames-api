const report = (...messages) => console.log('[Convert Playstats to Playrecords]', ...messages)
const { model } = require('../')
const convertGSheetsDate = require('../src/util/convertGSheetsDate')

async function start () {
  const { readers, writers } = await model()
  const { readJson } = readers
  const { writeJson } = writers

  report('Reading Playstats')
  const playstats = await readJson('cali-playstats.json')

  const records = playstats.filter(item => item.date > 0).map(playstat => {
    let datecode
    try {
      datecode = convertGSheetsDate(playstat.date)
    } catch (ex) {
      report('Error converting date:', playstat.date, { playstat })
    }
    return { ...playstat, date: datecode }
  }).filter(n => n)

  await writeJson('Converted Playstats to Playrecords', 'convert-playstats-to-playrecords.json', records)

  const work = records.map(playrecord => {
    const [year, month] = playrecord.date.split('-')
    const filepath = `playrecords/${year}/${month}/${playrecord.date}L${playrecord.lineNumber}.json`
    return writeJson('Store Playrecord', filepath, playrecord)
  })
  return await Promise.all(work)
}

module.exports = start
