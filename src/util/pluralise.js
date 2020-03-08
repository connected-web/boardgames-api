const pluralMap = {
  date: 'dates',
  winner: 'winners',
  coOpOutcome: 'coOpOutcomes',
  notes: 'notes',
  coOp: 'coOpTypes',
  mechanics: 'mechanics'
}

function pluralise (key) {
  return pluralMap[key] || false
}

module.exports = pluralise
