const log = []
const sortByFeedPriority = require('../util/sortByFeedPriority')
const report = (...messages) => log.push(['[Board Game Challenge Grids]', ...messages].join(' '))

const mutateRemoveEmpty = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      mutateRemoveEmpty(obj[key])
    } else if (obj[key] == null) {
      delete obj[key]
    }
  })
}

const challenges = {
  2018: {

  },
  2019: {

  },
  2020: {

  },
  2021: {

  }
}

async function createChallengeGrids (model) {
  const boardGameFeed = model.calisaurus.feed
  const gridsByYear = {}

  report(`Create grids by year from ${boardGameFeed.length} items`)

  mutateRemoveEmpty(gridsByYear)

  Object.entries(challenges).forEach(([year, challenge]) => {
    report('Challenge', year, JSON.stringify(challenge))
  })

  model.calisaurus.challengeGrids = { byYear: gridsByYear }

  return { byYear: gridsByYear, log }
}

function init (model) {
  return () => createChallengeGrids(model)
}

module.exports = init
