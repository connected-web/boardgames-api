const { fetch, write } = require('promise-path')
const convert = require('xml-js')
const objectIds = require('./boardgame-ids.json')
console.log(objectIds)

objectIds.forEach(fetchBoardGame)

function fetchBoardGame(objectId) {
  const apiUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${objectId}&stats=1`
  console.log('[Fetch From API]', apiUrl)
  fetch(apiUrl)
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
    })
    .catch(ex => {
      console.error('[Fetch Error]', ex, ex.stack)
    })
}
