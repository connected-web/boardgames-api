const { fetch, write } = require('promise-path')
const convert = require('xml-js')
const username = process.env.USERNAME

console.log('Stubbed fetcher')

const collectionUrl = `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}`

console.log('[Fetch Collection]', collectionUrl)
fetch(collectionUrl)
  .then(response => {
    console.log('[Raw Fetch]', response)
    const result = convert.xml2js(response, {compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true})
    console.log('[JSON]', JSON.stringify(result, null, 2))
    return result
  })
  .then(collection => {
    const body = JSON.stringify(collection, null, 2)
    write('collection.json', body, 'utf8')
  })
  .catch(ex => {
    console.error('[Fetch Error]', ex, ex.stack)
  })
