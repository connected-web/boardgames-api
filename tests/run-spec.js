const config = require('./helpers/config')
const { run, position } = require('promise-path')
const { expect } = require('chai')
const basepath = position(__dirname, '../')

const expected = `[Boardgame API Run] Available scripts to run:
  node run create-bgg-index
  node run create-boardgame-index
  node run create-boardgame-list
  node run download-bgg-collection
  node run download-bgg-entries
  node run download-cali-playstats
`;

describe('Board Game API Run', async () => {
  it('should list all available commands', async () => {
    const actual = await run(`node run`, basepath(''))
    expect(actual.stdout).to.deep.equal(expected)
  })
})