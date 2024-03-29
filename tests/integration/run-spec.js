const { run, position } = require('promise-path')
const { expect } = require('chai')
const basepath = position(__dirname, '../../')

const expected = `[Board Game API Run] Available scripts to run:
  node run all
  node run convert-playstats-to-playrecords
  node run create-all
  node run create-bgg-index
  node run create-boardgame-challenge-grids
  node run create-boardgame-feed
  node run create-boardgame-index
  node run create-boardgame-list
  node run create-boardgame-summaries
  node run create-boardgame-summaries-by-tags
  node run create-unique-list-of-played-games
  node run download-all
  node run download-bgg-collection
  node run download-bgg-entries
  node run download-cali-game-index
  node run download-cali-playrecords
  node run download-cali-playstats
  node run update-all
`

describe('Board Game API Run', async () => {
  it('should list all available commands', async () => {
    const actual = await run('node run', basepath(''))
    expect(actual.stdout).to.deep.equal(expected)
  })
})
