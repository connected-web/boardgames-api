const FtpDeploy = require('ftp-deploy')
const fs = require('fs')
const path = require('path')

const passwords = JSON.parse(fs.readFileSync(path.join(__dirname, '.ftppass')))
const mode = process.argv[2] || false

const FTP_HOST = 'ftp.calisaurus.net'

const liveUser = passwords['boardgames-api']

const defaultConfig = {
  user: liveUser.username,
  password: liveUser.password, // optional, prompted if none given
  host: FTP_HOST,
  port: 21,
  localRoot: path.join(__dirname, '../'),
  remoteRoot: '/',
  // include: ['*', '**/*'],      // this would upload everything except dot files
  include: [], // ['*.php', 'dist/*'],
  exclude: ['.ftp*', '.git*', '.hta*', 'deploy', 'tasklist.md', 'readme.md'], // ['dist/**/*.map'], // e.g. exclude sourcemaps - ** exclude: [] if nothing to exclude **
  deleteRemote: false, // delete existing files at destination before uploading
  forcePasv: true // Passive mode is forced (EPSV command is not sent)
}

const modes = {
  'live-php': () => deploy({
    include: ['api/**/*']
  }),
  'live-summaries': () => deploy({
    include: ['data/summaries/*', 'data/challenge-grids/*']
  }),
  'live-summaries-2020': () => deploy({
    include: ['data/summaries/*2020*']
  }),
  'live-summaries-2021': () => deploy({
    include: ['data/summaries/*2021*']
  }),
  'live-index': () => deploy({
    include: ['data/summaries/*']
  }),
  'live-data': () => deploy({
    include: ['data/**/*']
  }),
  'live-boardgames': () => deploy({
    include: ['boardgames/**/*']
  })
}

function createDeployer () {
  const deployer = new FtpDeploy()
  deployer.on('uploading', function (data) {
    console.log('[Deploy] Uploading :', `${data.transferredFileCount} / ${data.totalFilesCount} ::: ${data.filename}`)
  })

  deployer.on('uploaded', function (data) {
    console.log('[Deploy] Uploaded  :', `${data.transferredFileCount} / ${data.totalFilesCount} ::: ${data.filename}`)
  })

  deployer.on('log', function (data) {
    console.log('[Deploy]', data)
  })

  return deployer
}

async function deploy (variation, passwordId) {
  try {
    console.log('[Deploy]', mode, ':', variation)

    // add password after logging the variation
    const user = passwords[passwordId] || liveUser
    variation.user = user.username
    variation.password = user.password

    // create and configure deployer
    const deployer = createDeployer()
    const ftpConfig = Object.assign({}, defaultConfig, variation)
    ftpConfig.exclude = [].concat(defaultConfig.exclude, variation.exclude || [])

    const result = await deployer.deploy(ftpConfig)

    console.log('[Deploy] Finished:', result)
  } catch (ex) {
    console.log('[Deploy] Error:', ex)
  }
}

async function run (mode) {
  console.log('[Deploy]', mode)
  const fn = modes[mode]
  if (fn) {
    await fn()
    console.log('[Deploy] Completed', mode)
  } else {
    console.log(`[Deploy] No mode found with the name: (${mode})`)
    console.log('  Available modes:', Object.keys(modes).join(', '))
  }
}

run(mode)
