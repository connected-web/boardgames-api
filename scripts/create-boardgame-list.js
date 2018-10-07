const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game List]', ...messages)

async function start () {
  const bggCollection = require(datapath('bgg-collection.json'))
  const caliCollection = require(datapath('cali-playstats.json'))

  const bggBoardGameNames = bggCollection.items[0].item.map(item => item.name[0]._text[0])
  const caliBoardGameNames = Array.from(new Set(caliCollection.map(item => item.game)))

  const overlap = bggBoardGameNames.filter(n => caliBoardGameNames.includes(n)).sort()
  const bggOnly = bggBoardGameNames.filter(n => !caliBoardGameNames.includes(n)).sort()
  const caliOnly = caliBoardGameNames.filter(n => !bggBoardGameNames.includes(n)).sort()

  const stats = {
    'Number of Board Game Geek board games': bggBoardGameNames.length,
    'Number of Cali board games': caliBoardGameNames.length,
    'Overlap size between lists': overlap.length,
    'Board Game Geek only games': bggOnly.length,
    'Cali only games': caliOnly.length
  }

  caliCollection.forEach(item => {
    if (!item.game) {
      report('No game property found on item:', item, new Date(1900, 0, item.date))
    }
  })

  const filename = 'boardgame-names.json'
  report('Writing Board Game List:', stats, 'to', filename)

  return write(datapath(filename), JSON.stringify({boardGameGeek: bggBoardGameNames, cali: caliBoardGameNames, overlap, bggOnly, caliOnly, stats}, null, 2), 'utf8')
}

module.exports = start
