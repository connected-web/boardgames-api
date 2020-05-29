const report = (...messages) => console.log('[Check Issue]', ...messages)

const issueId = process.argv[3]
const issueTitle = process.argv[4]
const expectedIssueTitle = process.argv[5]

async function start () {
  report('Issue Id', issueId)
  report('Issue Title', issueTitle)
  report('Expected Issue Title', expectedIssueTitle)
  process.exit(1)
}

module.exports = start
