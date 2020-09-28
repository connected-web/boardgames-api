function daysBetween (firstDate, secondDate) {
  const flatStart = new Date(firstDate.toISOString().substring(0, 10))
  const flatEnd = new Date(secondDate.toISOString().substring(0, 10))

  const oneDayInMilliseconds = 24 * 60 * 60 * 1000
  const firstTime = flatStart.getTime()
  const secondTime = flatEnd.getTime()
  const millisecondsBetween = Math.abs(firstTime - secondTime)
  return Math.round(millisecondsBetween / oneDayInMilliseconds) + 1
}

module.exports = daysBetween
