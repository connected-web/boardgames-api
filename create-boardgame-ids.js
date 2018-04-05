const { write } = require('promise-path')

const collection = require('./collection.json')
const boardGameIds = collection.items[0].item.map(returnBoardGameId)

function returnBoardGameId (item) {
  return item._attributes.objectid
}
console.log(boardGameIds)

write('./boardgame-ids.json', JSON.stringify(boardGameIds, null, 2), 'utf8')
