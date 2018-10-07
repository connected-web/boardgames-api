const { fetch, write, position } = require('promise-path')
const convert = require('xml-js')
const datapath = position(__dirname, '../data')
const username = 'hannardynamite'
const collectionUrl = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`
const report = (...messages) => console.log('[Download Board Game Geek Collection]', ...messages)

async function start () {
  report('From:', collectionUrl)
  try {
    const response = await fetch(collectionUrl)
    // console.log('[Download Boardgame Collection] Raw fetch:', response)
    const collection = await convert.xml2js(response, {compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true})
    // console.log('Download Boardgame Collection] JSON:', JSON.stringify(collection, null, 2))
    const body = JSON.stringify(collection, null, 2)
    const filename = 'bgg-collection.json'
    report('Downloaded', body.length, 'bytes; writing to:', filename)
    return write(datapath(filename), body, 'utf8')
  } catch (ex) {
    report('Error fetching data:', ex, ex.stack)
  }
}

module.exports = start
