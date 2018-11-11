function convertGSheetsDate (gsheetsDate) {
  const date = new Date((gsheetsDate - 25567 - 2) * 86400 * 1000)
  return date.toISOString().substring(0, 10)
}

module.exports = convertGSheetsDate
