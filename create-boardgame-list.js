const { write } = require('promise-path')

const bggCollection = require('./bgg-collection.json')
const boardGameNames = bggCollection.items[0].item.map(returnBoardGameName)

function returnBoardGameName (item) {
  return item.name[0]._text[0]
}
console.log(boardGameNames)


write('./boardgame-names.json', JSON.stringify(boardGameNames, null, 2), 'utf8')
