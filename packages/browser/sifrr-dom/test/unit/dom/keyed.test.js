const { makeChildrenEqualKeyed, longestPositiveIncreasingSubsequence } = require('../../../src/dom/keyed');
const { buildData, dataToChildNodes, parent, moveEl } = require('../../helpers/keyed');

describe('Keyed', () => {
  describe('longestPositiveIncreasingSubsequence', () => {
    it('tests', async () => {
      let res = longestPositiveIncreasingSubsequence([0, 1, 2, 4, 3, 5], 0);
      expect(res).to.deep.equal([0, 1, 2, 4, 5]);

      res = longestPositiveIncreasingSubsequence([0, 1, 2, 4], 0);
      expect(res).to.deep.equal([0, 1, 2, 3]);

      res = longestPositiveIncreasingSubsequence([3, 1, 2, 0], 0);
      expect(res).to.deep.equal([1, 2]);

      res = longestPositiveIncreasingSubsequence([-1, -1, 2, 0], 0);
      expect(res).to.deep.equal([3]);

      res = longestPositiveIncreasingSubsequence([4, 3, 2, 1, 0], 0);
      expect(res).to.deep.equal([4]);
    });
  });

  describe('makeChildrenEqualKeyed', () => {
    it('replaces all', () => {
      const oldData = buildData(10);
      const newData = buildData(10, 11);
      const childNodes = dataToChildNodes(oldData);
      makeChildrenEqualKeyed({ childNodes: childNodes }, newData, x => x, 'id');

      expect(childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('skips prefixes and suffixes', () => {
      const oldData = buildData(10);
      const newData = buildData(10).map(o => {
        if (o.id === 5) o.id = 11;
        return o;
      });
      const childNodes = dataToChildNodes(oldData);
      makeChildrenEqualKeyed({ childNodes: childNodes }, newData, x => x, 'id');

      expect(childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('swaps backward', () => {
      const oldData = buildData(10);
      const newData = buildData(10);
      moveEl(newData, 6, 2);
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, x => x, 'id');

      expect(par.childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('swaps forward', () => {
      const oldData = buildData(10);
      const newData = buildData(10);
      moveEl(newData, 3, 7);
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, x => x, 'id');

      expect(par.childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('swaps forward and backward', () => {
      const oldData = buildData(10);
      const newData = buildData(10);
      moveEl(newData, 3, 7);
      moveEl(newData, 8, 3);
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, x => x, 'id');

      expect(par.childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('swaps forward last element', () => {
      const oldData = buildData(10);
      const newData = buildData(10);
      moveEl(newData, 3, 9);
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, x => x, 'id');

      expect(par.childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('shrinks', () => {
      const oldData = buildData(10);
      const newData = buildData(9);
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, x => x, 'id');

      expect(par.childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('adds', () => {
      const oldData = buildData(10);
      const newData = buildData(11);
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, x => { return { state: x }; }, 'id');

      expect(par.childNodes).to.deep.equal(dataToChildNodes(newData));
    });

    it('rearranges', () => {
      const oldData = buildData(10);
      const newData = buildData(10);
      moveEl(newData, 3, 7);
      moveEl(newData, 4, 9);
      moveEl(newData, 1, 3);
      moveEl(newData, 8, 2);
      moveEl(newData, 0, 2);
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, x => x, 'id');

      expect(par.childNodes).to.deep.equal(dataToChildNodes(newData));
    });
  });
});
