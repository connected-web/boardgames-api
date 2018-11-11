function reduceNameToBoardGameApiId (name) {
  return name.toLowerCase()
    .replace(/[.']/g, '')
    .replace(/[^a-z\d-]/g, ' ')
    .trim()
    .replace(/(\s)+/g, '-')
}

module.exports = reduceNameToBoardGameApiId
