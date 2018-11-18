const { position } = require('promise-path')
const writeFile = require('./util/writeFile')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game List]', ...messages)

async function start () {
  const bggCollection = require(datapath('bgg-collection.json'))
  const caliCollection = require(datapath('cali-playstats.json'))
  const boardGameIndex = require(datapath('boardgame-index.json'))

  const bggBoardGameNames = bggCollection.items[0].item.map(item => item.name[0]._text[0])
  const caliBoardGameNames = Array.from(new Set(caliCollection.map(item => item.name)))

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
      report('No game name property found on item:', item, new Date(1900, 0, item.date), 'please check column headings in Google Sheets.')
    }
  })

  const boardGameNames = {
    boardGameGeek: bggBoardGameNames,
    cali: caliBoardGameNames,
    overlap,
    bggOnly,
    caliOnly,
    stats
  }

  const boardGameList = { games: Object.entries(boardGameIndex).map(kvp => {
    const boardGameApiId = kvp[0]
    const entry = kvp[1]
    return {
      name: entry.name,
      boardGameApiId
    }
  }) }

  return Promise.all([
    writeFile('Board Game Names', 'boardgame-names.json', boardGameNames),
    writeFile('Board Game List', 'boardgame-list.json', boardGameList)
  ])
}

module.exports = start
