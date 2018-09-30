const { fetch, write, position } = require('promise-path')
const convert = require('xml-js')
const datapath = position(__dirname, '../data')
const username = 'hannardynamite'
const collectionUrl = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`

async function start () {
  console.log('[Download Board Game Geek Collection] From:', collectionUrl)
  try {
    const response = await fetch(collectionUrl)
    // console.log('[Download Boardgame Collection] Raw fetch:', response)
    const collection = await convert.xml2js(response, {compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true})
    // console.log('Download Boardgame Collection] JSON:', JSON.stringify(collection, null, 2))
    const body = JSON.stringify(collection, null, 2)
    console.log('[Download Board Game Geek Collection] Downloaded data:', body.length, 'bytes; writing to local file')
    return write(datapath('bgg-collection.json'), body, 'utf8')
  } catch (ex) {
    console.error('[Download Board Game Geek Collection] Fetch error:', ex, ex.stack)
  }
}

module.exports = start
