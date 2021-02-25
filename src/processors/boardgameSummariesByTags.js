const log = []
const report = (...messages) => log.push(['[Create Board Game Summaries by Tags]', ...messages].join(' '))

function copy (data) {
  return JSON.parse(JSON.stringify(data))
}

async function createBoardGameSummariesByTags (model) {
  const { index } = model.calisaurus

  report('TODO: Time to get tagging?')
  report('Index', Object.keys(index))

  const summariesByTags = {
    gameFamily: {
      pandemic: {
        some: 'data for games of pandemic'
      },
      'love-letter': {
        some: 'data for games of love-letter'
      }
    },
    type: {
      strategy: {
        some: 'data for strategy games'
      },
      'worker-placement': {
        some: 'data for worker-placement games'
      }
    }
  }

  return {
    summariesByTags: copy(summariesByTags),
    log
  }
}

function init (model) {
  return () => createBoardGameSummariesByTags(model)
}

module.exports = init
