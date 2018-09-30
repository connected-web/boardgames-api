const { write, position } = require('promise-path')
const datapath = position(__dirname, '../data')

async function start () {
  console.log('[Create Board Game Index]', 'Requires data/bgg-collection.json')
  console.log('[Create Board Game Index]', 'Requires data/cali-playstats.json')

  const collection = require(datapath('bgg-collection.json'))
  const caliPlayStats = require(datapath('cali-playstats.json'))

  const boardGameIndex = {}
  collection.items[0].item.reduce(mapBoardGameGeekGame, boardGameIndex)
  caliPlayStats.reduce(mapCaliPlayStatGame, boardGameIndex)

  function mapBoardGameGeekGame (accumulator, item) {
    const name = item.name[0]._text[0]
    const id = item._attributes.objectid
    accumulator[name] = {
      boardGameGeekGameId: id,
      boardGameGeekName: name,
      game: name
    }
    return accumulator
  }

  function mapCaliPlayStatGame (accumulator, item) {
    const name = item.game
    accumulator[name] = accumulator[name] || {}
    Object.keys(item).forEach(key => {
      if (accumulator[name][key] && accumulator[name][key] !== item[key]) {
        accumulator[name][`${key}_conflict`] = item[key]
      } else {
        accumulator[name][key] = item[key]
      }
    })
    return accumulator
  }

  console.log('[Created Boardgame Index]', boardGameIndex)

  return write(datapath('boardgame-index.json'), JSON.stringify(boardGameIndex, null, 2), 'utf8')
}

// Convert Excel dates into JS date objects
//
// @param excelDate {Number}
// @return {Date}

function getJsDateFromExcel(excelDate) {

  // JavaScript dates can be constructed by passing milliseconds
  // since the Unix epoch (January 1, 1970) example: new Date(12312512312);

  // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
  // 2. Convert to milliseconds.

	return new Date((excelDate - (25567 + 1))*86400*1000);
}

module.exports = start
