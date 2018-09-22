const { fetch, write } = require('promise-path')
const convert = require('xml-js')
const position = require('./helpers/position')(__dirname, '../data')
const savepath = require('./helpers/position')(__dirname, '../boardgames')

function start() {
  const objectIndex = require(position('boardgame-index.json'))
  const objectIds = Object.keys(objectIndex).map(k => objectIndex[k])

  console.log('[Download Boardgame Entries] Boardgame IDs:', objectIds.join(', '))

  const work = objectIds.map(n => {
    console.log('[Download Boardgame Entries] Creating working item:', n)
    return () => fetchBoardGame(n)
  })

  async function fetchBoardGame(objectId) {
    const apiUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${objectId}&stats=1`
    console.log('[Download Boardgame Entries] Fetch from API:', apiUrl)
    try {
      const response = await fetch(apiUrl)
      //console.log('[Raw Fetch]', response)
      //write(`boardgame-${objectId}.xml`, response, 'utf8')
      const collection = convert.xml2js(response, {compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true})
      //console.log('[JSON]', JSON.stringify(collection, null, 2))
      const body = JSON.stringify(collection, null, 2)
      console.log('[Download Boardgame Entries] Downloaded', body.length, `bytes, writing to: boardgames/boardgame-${objectId}.json`)
      return write(savepath(`boardgame-${objectId}.json`), body, 'utf8')
    } catch(ex) {
      console.error('[Download Boardgame Entries] Fetch error:', ex, ex.stack)
    }
  }

  const results = []
  async function doWork(work) {
    if (work.length > 0) {
      let items = work.splice(0, 2)
      console.log('[Download Boardgame Entries] Fetching next entry:', items.length, 'items;', work.length, 'remaining')
      let activeWork = items.map(n => n())
      let block = await Promise.all(activeWork)
      results.concat(block)
      setTimeout(doWork, 5000, work)
    }
  }

  return doWork(work)
}

module.exports = start
