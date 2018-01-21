console.log('Stubbed entrypoint...')
console.log('  To regenerate collection.json, run:')
console.log('  node fetch-collection.js')

const collection = require('./collection.json')
const names = collection.items[0].item.map(returnBoardGameName)

function returnBoardGameName(item) {
  return item.name[0]._text[0]
}
console.log(names)
