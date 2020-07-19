const { fetch, write, position } = require('promise-path')
const convert = require('xml-js')
const datapath = position(__dirname, '../data')
const savepath = position(__dirname, '../boardgames')
const report = (...messages) => console.log('[Download Board Game Geek Entries]', ...messages)

function start () {
  const objectIndex = require(datapath('bgg-index.json'))
  const objectIds = Object.keys(objectIndex).map(k => objectIndex[k])
  let rateLimitFailureCount = 0

  report('Boardgame IDs:', objectIds.join(', '))

  const workQueue = []
  const workItems = objectIds.map(n => {
    report('Creating working item:', n)
    return () => fetchBoardGame(n, workQueue)
  })
  workItems.forEach(n => workQueue.push(n))

  async function fetchBoardGame (entry, workQueue) {
    const apiUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${entry.boardGameGeekGameId}&stats=1`
    report('Fetch from API:', apiUrl)
    try {
      const response = await fetch(apiUrl)
      // console.log('[Raw Fetch]', response)
      const collection = convert.xml2js(response, { compact: true, alwaysArray: true, ignoreDeclaration: true, nativeType: true })
      // console.log('[JSON]', JSON.stringify(collection, null, 2))
      const body = JSON.stringify(collection, null, 2)
      if (body.length === 147 || body.match(/Rate limit exceeded/)) {
        report('Rate limit exceeded, requeing', entry.boardGameGeekGameId)
        workQueue.push(() => fetchBoardGame(entry, workQueue))
        rateLimitFailureCount++
      } else {
        report('Downloaded', body.length, `bytes, writing to: boardgames/boardgame-${entry.boardGameGeekGameId}.json`)
        return write(savepath(`boardgame-${entry.boardGameGeekGameId}.json`), body, 'utf8')
      }
    } catch (ex) {
      report('Fetch error:', ex, ex.stack)
    }
  }

  let resolveWork, rejectWork
  const callbackPromise = new Promise((resolve, reject) => {
    resolveWork = resolve
    rejectWork = reject
  })

  const results = []
  async function doWork (work) {
    const itemsPerBatch = 1
    const delayPerBatch = 600
    const rateDelayInMs = 100 // ms
    try {
      if (work.length > 0) {
        const items = work.splice(0, itemsPerBatch)
        report('Fetching next entry:', items.length, 'items;', work.length, 'remaining;', Math.min(items.length, rateLimitFailureCount), 'rate limit retries waiting.')
        const activeWork = items.map(n => n())
        const block = await Promise.all(activeWork)
        results.concat(block)
        setTimeout(doWork, delayPerBatch + (rateLimitFailureCount * rateDelayInMs), work)
      } else {
        resolveWork(results)
      }
    } catch (ex) {
      report('Unable to complete work', ex)
      rejectWork(ex)
    }
  }

  doWork(workQueue)

  return callbackPromise
}

module.exports = start
