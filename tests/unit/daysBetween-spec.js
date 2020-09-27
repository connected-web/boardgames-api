const daysBetween = require('../../src/util/daysBetween')
const { expect } = require('chai')

const testCases = [{
  startDate: '2018-03-01',
  endDate: '2018-03-31',
  expected: 31
}, {
  startDate: '2018-02-01',
  endDate: '2018-02-28',
  expected: 28
}, {
  startDate: '2020-03-01',
  endDate: '2020-03-31',
  expected: 31
}, {
  startDate: '2020-02-01',
  endDate: '2020-02-29',
  expected: 29
}]

describe('Days between function', () => {
  describe('should correctly calculate the number of days between two dates', () => {
    testCases.forEach(({ startDate, endDate, expected }) => {
      it(`there should be ${expected} days between ${startDate} and ${endDate}`, () => {
        const actual = daysBetween(new Date(startDate), new Date(endDate))
        expect(actual).to.equal(expected)
      })
    })
  })
})
