const report = (...messages) => console.log('[Check Issue]', ...messages)

const issueId = process.argv[3]
const issueTitle = (process.argv[4] + '').trim()
const expectedIssueTitle = (process.argv[5] + '').trim()

async function start () {
  if (issueTitle === expectedIssueTitle) {
    report('Matched', issueId, expectedIssueTitle)
    process.exit(0)
  }
  else {
    report('Did not match', issueId, issueTitle)
    process.exit(1)
  }
}

module.exports = start
