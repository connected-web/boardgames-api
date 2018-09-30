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

  function runScriptIfFunction(n) {
    if (typeof scripts[n] === 'function') {
      return scripts[n]()
    }
    else {
      return console.log('[Board Game API Run] Script', n, 'is not a function')
    }
  }

  scripts.all = async () => {
    try {
      return Promise.all([
        'download-cali-playstats',
        'download-bgg-collection',
        'download-bgg-entries',
        'create-bgg-index',
        'create-boardgame-list',
        'create-boardgame-index'
      ].map(runScriptIfFunction))
    } catch (ex) {
      console.log('[Boardgame API Run] Scripts:', scripts)
      throw ex
    }
  }

  if (scripts[scriptToRun]) {
    console.log('[Board Game API Run] Running', scriptToRun)
    await scripts[scriptToRun]()
  } else {
    console.log('[Board Game API Run] Available scripts to run:')
    scriptNames.forEach(n => console.log(' ', `node run ${n}`))
  }
}

start()
