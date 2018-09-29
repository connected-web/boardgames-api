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

  scripts.all = async () => {
    return Promise.all([
      'download-gsheets-data',
      'download-boardgame-collection',
      'download-boardgame-entries',
      'create-boardgame-index',
      'create-boardgame-list'
    ].map(async n => scripts[n]()))
  }

  if (scripts[scriptToRun]) {
    console.log('[Boardgames API Run] Running', scriptToRun)
    await scripts[scriptToRun]()
  } else {
    console.log('[Boardgame API Run] Available scripts to run:')
    scriptNames.forEach(n => console.log(' ', `node run ${n}`))
  }
}

start()
