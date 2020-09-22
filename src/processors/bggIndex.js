const log = []
const report = (...messages) => log.push(['[Create Board Game Geek Index]', ...messages].join(' '))

function mapBoardGame (index, item) {
  const name = item.name[0]._text[0]
  const id = item._attributes.objectid
  index[name] = {
    boardGameGeekGameId: id
  }
  return index
}

async function buildIndex (model) {
  const collection = model.boardGameGeek.collection
  const firstItemInCollection = collection.items[0]
  const boardGameGeekIndex = (firstItemInCollection) ? firstItemInCollection.item.reduce(mapBoardGame, {}) : {}

  if (!firstItemInCollection) {
    report('No items found in boarg game geek collection:', JSON.stringify(collection, null, 2))
  }

  report('Index', boardGameGeekIndex)
  model.boardGameGeek.index = boardGameGeekIndex
  return { index: model.boardGameGeek.index, log }
}

function init (model) {
  return () => buildIndex(model)
}

module.exports = init
