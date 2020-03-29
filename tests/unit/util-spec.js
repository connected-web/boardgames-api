const { expect } = require('chai')
const mostFrequentWordsIn = require('../../src/util/mostFrequentWordsIn')

describe('Boardgames API Utils', () => {
  describe('Most Frequent Words In', () => {
    it('should return counts of the most common words in a given list', () => {
      const words = ['Apple', 'Banana', 'Orange', 'Banana', 'Apple', 'Pineapple', 'Peach', 'Orange']
      const actual = mostFrequentWordsIn(words)
      const expected = [{
        word: 'Apple',
        count: 2
      }, {
        word: 'Banana',
        count: 2
      }, {
        word: 'Orange',
        count: 2
      }]
      expect(actual).to.deep.equal(expected)
    })
  })
})