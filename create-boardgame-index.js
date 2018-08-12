const { write } = require('promise-path')

const collection = require('./bgg-collection.json')
const boardGameIndex = collection.items[0].item.reduce(mapBoardGame, {})

function mapBoardGame (accumulator, item) {
   const name = item.name[0]._text[0]
   const id = item._attributes.objectid
   accumulator[name] = id
   return accumulator
}
console.log(boardGameIndex)

write('./boardgame-index.json', JSON.stringify(boardGameIndex, null, 2), 'utf8')
