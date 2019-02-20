const { makeChildrenEqualKeyed, longestPositiveIncreasingSubsequence } = require('../../../src/dom/keyed');

describe('Keyed', () => {
  describe('longestPositiveIncreasingSubsequence', () => {
    it('test', async () => {
      const res = longestPositiveIncreasingSubsequence([-1, 5, -1, 4, 3, -1], 0);

      console.log(res);
    });
  });

  describe('makeChildrenEqualKeyed', () => {

  });
});
