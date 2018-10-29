module.exports = (num, len = 2) => {
  let result = num + ''
  while (result.length < len) {
    result = '0' + result
  }
  return result
}
