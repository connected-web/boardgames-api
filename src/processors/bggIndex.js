const log = []
const report = (...messages) => log.push(['[Create Board Game Geek Index]', ...messages].join(' '))

async function buildIndex (model) {
  const collection = model.boardGameGeek.collection
  const boardGameGeekIndex = collection.items[0].item.reduce(mapBoardGame, {})

  function mapBoardGame (index, item) {
    const name = item.name[0]._text[0]
    const id = item._attributes.objectid
    index[name] = {
      boardGameGeekGameId: id
    }
    return index
  }

  report('Index', boardGameGeekIndex)
  model.boardGameGeek.index = boardGameGeekIndex
  return { index: model.boardGameGeek.index, log }
}

function init (model) {
  return () => buildIndex(model)
}

module.exports = init
