function convertDDMMYYYYDate (stringDate) {
  const [dd, mm, yyyy] = stringDate.split('/')
  return [yyyy, mm, dd].join('-')
}

module.exports = convertDDMMYYYYDate
