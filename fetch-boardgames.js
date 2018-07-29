const { fetch, write } = require('promise-path')
const convert = require('xml-js')
const objectIndex = require('./boardgame-index.json')
const objectIds = Object.keys(objectIndex).map(k => objectIndex[k])
console.log('Boardgame IDs:', objectIds.join(', '))

const work = objectIds.map(n => {
  console.log('Creating working item:', n)
  return () => fetchBoardGame(n)
})

function fetchBoardGame(objectId) {
  const apiUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${objectId}&stats=1`
  console.log('[Fetching from API]', apiUrl)
  return fetch(apiUrl)
    .then(response => {
      //console.log('[Raw Fetch]', response)

      //write(`boardgame-${objectId}.xml`, response, 'utf8')
      const result = convert.xml2js(response, {compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true})
      //console.log('[JSON]', JSON.stringify(result, null, 2))
      return result
    })
    .then(collection => {
      const body = JSON.stringify(collection, null, 2)
      write(`boardgames/boardgame-${objectId}.json`, body, 'utf8')
      console.log('Wrote', `boardgames/boardgame-${objectId}.json`)
    })
    .catch(ex => {
      console.error('[Fetch Error]', ex, ex.stack)
    })
}

const results = []
async function doWork(work) {
  if (work.length > 0) {
    let items = work.splice(0, 2)
    console.log('Working on next', items.length, 'items;', work.length, 'remaining')
    let activeWork = items.map(n => n())
    let block = await Promise.all(activeWork)
    results.concat(block)
    setTimeout(doWork, 5000, work)
  }
}

doWork(work)
