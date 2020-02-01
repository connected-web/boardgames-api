const zp = require('./zeropad')

let count = 0

module.exports = (name) => {
  count++
  return `./tests/screenshots/${zp(count)}-${name}.png`
}
