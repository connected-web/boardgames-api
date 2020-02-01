function init (model) {
  return async () => {
    return {
      warning: 'This action takes forever; please see local repo for cached implementation using `node run download-bgg-entries`'
    }
  }
}

module.exports = init
