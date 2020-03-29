function mostFrequentWordsIn(listOfWords=[]) {
  const counts = listOfWords.reduce((acc, word) => {
    acc[word] = acc[word] || 0
    acc[word]++
    return acc
  }, {})

  const frequencyList = Object.entries(counts).map(([word, count]) => {
    return {
      word, 
      count
    }
  }).sort((a, b) => b.count - a.count)

  const highestCount = (frequencyList[0] || {}).count || 0
  const mostFrequentWords = frequencyList.filter(item => item.count === highestCount)

  return mostFrequentWords
}

module.exports = mostFrequentWordsIn