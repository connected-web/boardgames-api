const convert = require('xml-js')
const username = 'hannardynamite'
const log = []
const report = (...messages) => log.push(['[Download Board Game Geek Collection]', ...messages].join(' '))

async function downloadCollection ({ fetch }, username) {
  const collectionUrl = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`
  report('From:', collectionUrl)
  try {
    const response = await fetch(collectionUrl)
    const collection = await convert.xml2js(response, { compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true })
    return collection
  } catch (ex) {
    report('Error fetching data:', ex, ex.stack)
  }
}

async function retryCollection ({ fetch }, username, retries = 2) {
  const response = await downloadCollection({ fetch }, username)
  if (response.message) {
    report(response.message)
    if (retries > 0) {
      return retryCollection({ fetch }, username, retries - 1)
    } else {
      return {
        items: []
      }
    }
  } else {
    return response
  }
}

function init (model) {
  return async () => {
    model.boardGameGeek.collection = await retryCollection(model.fetchers, username)
    return {
      collection: model.boardGameGeek.collection,
      log
    }
  }
}

module.exports = init
