const boardGameNames = require('./boardgame-names.json')

const randomIndex = Math.floor(Math.random() * boardGameNames.length)
const randomBoardGameName = boardGameNames[randomIndex]

console.log('Random pick:', randomIndex, 'of', boardGameNames.length, 'picked', randomBoardGameName)
