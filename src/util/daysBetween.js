function daysBetween (firstDate, secondDate) {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000
  const firstTime = firstDate.getTime()
  const secondTime = secondDate.getTime()
  const millisecondsBetween = Math.abs(firstTime - secondTime)
  return Math.round(millisecondsBetween / oneDayInMilliseconds) + 1
}

module.exports = daysBetween
