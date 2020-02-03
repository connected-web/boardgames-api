const log = []
const report = (...messages) => log.push(['[Create Board Game List]', ...messages].join(' '))

async function createBoardGameList (model) {
  const bggCollection = model.boardGameGeek.collection
  const caliCollection = model.calisaurus.playstats
  const boardGameIndex = model.calisaurus.index

  const bggBoardGameNames = bggCollection.items[0].item.map(item => item.name[0]._text[0]).filter(n => n)
  const caliBoardGameNames = Array.from(new Set(caliCollection.map(item => item.name))).filter(n => n)

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

  const boardgameGroups = {
    boardGameGeek: bggBoardGameNames,
    cali: caliBoardGameNames,
    overlap,
    bggOnly,
    caliOnly,
    stats
  }

  const boardGameList = Object.entries(boardGameIndex).map(kvp => {
    const boardGameApiId = kvp[0]
    const entry = kvp[1]
    return {
      name: entry.name,
      boardGameApiId
    }
  })

  model.calisaurus.boardgameGroups = boardgameGroups
  model.calisaurus.boardgameNames = boardGameList.map(n => n.name).sort()
  model.calisaurus.boardgameList = boardGameList

  return {
    boardgameGroups: model.calisaurus.boardgameGroups,
    boardgameNames: model.calisaurus.boardgameNames,
    boardgameList: model.calisaurus.boardgameList,
    log
  }
}

function init (model) {
  return () => createBoardGameList(model)
}

module.exports = init
