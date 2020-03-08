const { position, write } = require('promise-path')
const writeFile = require('../src/util/writeJson')
const datapath = position(__dirname, '../data')
const report = (...messages) => console.log('[Create Board Game Lists]', ...messages)
const { model, boardgameList } = require('../')

async function start () {
  report('Loading boardgame data from file system')

  const { calisaurus, boardGameGeek } = await model()

  boardGameGeek.collection = require(datapath('bgg-collection.json'))
  calisaurus.playstats = require(datapath('cali-playstats.json'))
  calisaurus.index = require(datapath('boardgame-index.json'))

  report('Processing boardgame lists')

  const result = await boardgameList()

  const listOfAllGames = result.boardgameList.map(n => n.name).sort()

  return Promise.all([
    writeFile('Board Game Groups', 'boardgame-groups.json', result.boardgameGroups),
    writeFile('Board Game Names', 'boardgame-names.json', result.boardgameNames),
    writeFile('Board Game List', 'boardgame-list.json', result.boardgameList),
    write(datapath('list-of-all-games.txt'), listOfAllGames.join('\n'), 'utf8')
  ])
}

module.exports = start
