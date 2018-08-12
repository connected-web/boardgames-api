const { write } = require('promise-path')

const bggCollection = require('./bgg-collection.json')
const caliCollection = require('./cali-boardgames.json')

const bggBoardGameNames = bggCollection.items[0].item.map(item => item.name[0]._text[0])
const caliBoardGameNames = Array.from(new Set(caliCollection.map(item => item.game)))

const overlap = bggBoardGameNames.filter(n => caliBoardGameNames.includes(n))
const bggOnly = bggBoardGameNames.filter(n => !caliBoardGameNames.includes(n))
const caliOnly = caliBoardGameNames.filter(n => !bggBoardGameNames.includes(n))

const stats = {
  'Number of Board Game Geek board games': bggBoardGameNames.length,
  'Number of Cali board games': caliBoardGameNames.length,
  'Overlap size between lists': overlap.length,
  'Board Game Geek only games': bggOnly.length,
  'Cali only games': caliOnly.length,
}

caliCollection.forEach(item => {
  if (!item.game) {
    console.log('Bad data on', item, new Date(1900, 0, item.date))
  }
})

console.log('Board Game name stats:', stats)

write('./boardgame-names.json', JSON.stringify({boardGameGeek: bggBoardGameNames, cali: caliBoardGameNames, overlap, stats}, null, 2), 'utf8')
