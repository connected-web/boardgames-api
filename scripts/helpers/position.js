const path = require('path')

function position (...startingPaths) {
  return (newPaths) => {
    const paths = [].concat(startingPaths, newPaths)
    return path.join(...paths)
  }
}

module.exports = position
