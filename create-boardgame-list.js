const { write } = require('promise-path')

const collection = require('./collection.json')
const boardGameNames = collection.items[0].item.map(returnBoardGameName)

function returnBoardGameName(item) {
  return item.name[0]._text[0]
}
console.log(boardGameNames)

write('./boardgame-names.json', JSON.stringify(boardGameNames, null, 2), 'utf8')
