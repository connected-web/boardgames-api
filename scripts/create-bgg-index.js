const report = (...messages) => console.log('[Create Board Game Geek Index]', ...messages)
const { model, bggIndex } = require('../')

async function start () {
  const { boardGameGeek, readers, writers } = await model()
  const { readJson } = readers
  const { writeJson } = writers

  report('Reading BGG Collection')
  boardGameGeek.collection = await readJson('bgg-collection.json')

  report('Creating BGG Index from Collection')
  const { index } = await bggIndex()
  return writeJson('Board Game Geek Index', 'bgg-index.json', index)
}

module.exports = start
