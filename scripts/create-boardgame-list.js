const { write } = require('promise-path')
const report = (...messages) => console.log('[Create Board Game Lists]', ...messages)
const { model, boardgameList } = require('../')

async function start () {
  report('Loading boardgame data from file system')

  const { calisaurus, boardGameGeek, writers, readers, positions } = await model()
  const { writeJson } = writers
  const { readJson } = readers
  const { datapath } = positions

  boardGameGeek.collection = await readJson('bgg-collection.json')
  calisaurus.playstats = await readJson('cali-playstats.json')
  calisaurus.index = await readJson('boardgame-index.json')

  report('Processing boardgame lists')

  const result = await boardgameList()

  const listOfAllGames = result.boardgameList.map(n => n.name).sort()

  return Promise.all([
    writeJson('Board Game Groups', 'boardgame-groups.json', result.boardgameGroups),
    writeJson('Board Game Names', 'boardgame-names.json', result.boardgameNames),
    writeJson('Board Game List', 'boardgame-list.json', result.boardgameList),
    write(datapath('list-of-all-games.txt'), listOfAllGames.join('\n'), 'utf8')
  ])
}

module.exports = start
