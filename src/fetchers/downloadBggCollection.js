const convert = require('xml-js')
const username = 'hannardynamite'
const log = []
const report = (...messages) => log.push(['[Download Board Game Geek Collection]', ...messages].join(' '))

async function downloadCollection ({ fetch }, username) {
  const collectionUrl = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`
  report('From:', collectionUrl)
  try {
    const response = await fetch(collectionUrl)
    const collection = await convert.xml2js(response, {compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true})
    return collection
  } catch (ex) {
    report('Error fetching data:', ex, ex.stack)
  }
}

function init (model) {
  return async () => {
    model.boardGameGeek.collection = await downloadCollection(model.fetchers, username)
    return {
      collection: model.boardGameGeek.collection,
      log
    }
  }
}

module.exports = init
