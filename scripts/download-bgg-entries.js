const { fetch, write, position } = require('promise-path')
const convert = require('xml-js')
const datapath = position(__dirname, '../data')
const savepath = position(__dirname, '../boardgames')

function start () {
  const objectIndex = require(datapath('bgg-index.json'))
  const objectIds = Object.keys(objectIndex).map(k => objectIndex[k])
  let rateLimitFailureCount = 0

  console.log('[Download Board Game Geek Entries] Boardgame IDs:', objectIds.join(', '))

  const workQueue = []
  const workItems = objectIds.map(n => {
    console.log('[Download Board Game Geek Entries] Creating working item:', n)
    return () => fetchBoardGame(n, workQueue)
  })
  workItems.forEach(n => workQueue.push(n))

  async function fetchBoardGame (entry, workQueue) {
    const apiUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${entry.boardGameGeekGameId}&stats=1`
    console.log('[Download Board Game Geek Entries] Fetch from API:', apiUrl)
    try {
      const response = await fetch(apiUrl)
      // console.log('[Raw Fetch]', response)
      const collection = convert.xml2js(response, {compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true})
      // console.log('[JSON]', JSON.stringify(collection, null, 2))
      const body = JSON.stringify(collection, null, 2)
      if (body.length === 147 || body.match(/Rate limit exceeded/)) {
        console.log('[Download Board Game Geek Entries] Rate limit exceeded, requeing', entry.boardGameGeekGameId)
        workQueue.push(() => fetchBoardGame(entry, workQueue))
        rateLimitFailureCount++
      } else {
        console.log('[Download Board Game Geek Entries] Downloaded', body.length, `bytes, writing to: boardgames/boardgame-${entry.boardGameGeekGameId}.json`)
        return write(savepath(`boardgame-${entry.boardGameGeekGameId}.json`), body, 'utf8')
      }
    } catch (ex) {
      console.error('[Download Board Game Geek Entries] Fetch error:', ex, ex.stack)
    }
  }

  const results = []
  async function doWork (work) {
    const itemsPerBatch = 1
    const delayPerBatch = 600
    const rateDelayInMs = 100 // ms
    if (work.length > 0) {
      let items = work.splice(0, itemsPerBatch)
      console.log('[Download Board Game Geek Entries] Fetching next entry:', items.length, 'items;', work.length, 'remaining;', Math.min(items.length, rateLimitFailureCount), 'rate limit retries waiting.')
      let activeWork = items.map(n => n())
      let block = await Promise.all(activeWork)
      results.concat(block)
      setTimeout(doWork, delayPerBatch + (rateLimitFailureCount * rateDelayInMs), work)
    }
  }

  return doWork(workQueue)
}

module.exports = start
