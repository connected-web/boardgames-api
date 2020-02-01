const path = require('path')
const { find } = require('promise-path')

const scriptToRun = process.argv[2] || false

async function start () {
  const scriptPaths = await find(path.join(__dirname, 'scripts/*.js'))
  const scriptNames = scriptPaths.map(n => n.match(/scripts\/([a-z-]+)\.js/)[1])
  const scripts = scriptNames.reduce((acc, n) => {
    acc[n] = require(`./scripts/${n}`)
    return acc
  }, {})

  function runScriptIfFunction (n) {
    if (typeof scripts[n] === 'function') {
      return scripts[n]()
    } else {
      return console.log('[Board Game API Run] Script', n, 'is not a function')
    }
  }

  scripts['create-all'] = async () => {
    return processScripts([
      'create-bgg-index',
      'create-boardgame-list',
      'create-boardgame-index',
      'create-boardgame-feed',
      'create-boardgame-summaries',
      'create-unique-list-of-played-games'
    ], scripts)
  }

  scripts['download-all'] = async () => {
    return processScripts([
      'download-cali-game-index',
      'download-cali-playstats',
      'download-bgg-collection',
      'download-bgg-entries'
    ], scripts)
  }

  scripts['update-owned-lists'] = async () => {
    return processScripts([
      'download-cali-game-index',
      'download-cali-playstats',
      'download-bgg-collection',
      'create-unique-list-of-played-games',
      'create-boardgame-list'
    ], scripts)
  }

  scripts.all = async () => {
    return processScripts([
      'download-all',
      'create-all'
    ], scripts)
  }

  async function processScripts (scriptsToRun, scriptIndex) {
    let nextScript
    const remainingScripts = [].concat(...scriptsToRun)
    try {
      const results = []
      while (remainingScripts.length > 0) {
        nextScript = remainingScripts.shift()
        const result = await scriptIndex[nextScript]()
        results.push(result)
      }
    } catch (ex) {
      console.log('[Boardgame API Run] Process scripts:', scriptsToRun, 'Remaining:', remainingScripts, 'running:', nextScript)
      throw ex
    }
  }

  if (scripts[scriptToRun]) {
    console.log('[Board Game API Run] Running', scriptToRun)
    await runScriptIfFunction(scriptToRun)
  } else {
    console.log('[Board Game API Run] Available scripts to run:')
    Object.keys(scripts).sort().forEach(n => console.log(' ', `node run ${n}`))
  }

  return scripts
}

const api = start()

module.exports = api
