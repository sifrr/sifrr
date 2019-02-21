const { makeChildrenEqualKeyed, longestPositiveIncreasingSubsequence } = require('../../../src/dom/keyed');
const { buildData, dataToChildNodes, parent, moveEl, findIndex } = require('../../helpers/keyed');

function expectSameState(nodes, states) {
  const nodeStates = nodes.map(n => n.state);
  expect(nodeStates).to.deep.equal(states);
}

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

      childNodes.forEach(n => {
        assert(n._setStub.calledOnce);
      });
      expectSameState(childNodes, newData);
    });

    it('skips prefixes and suffixes', () => {
      const oldData = buildData(10);
      const newData = buildData(10).map(o => {
        if (o.id === 5) o.id = 11;
        return o;
      });
      const childNodes = dataToChildNodes(oldData);
      makeChildrenEqualKeyed({ childNodes: childNodes }, newData, undefined, 'id');

      childNodes.forEach(n => {
        assert(n._setStub.calledOnce);
      });
      expectSameState(childNodes, newData);
    });

    it('swaps backward', () => {
      const oldData = buildData(10);
      const oldNodes = dataToChildNodes(oldData);
      const newData = buildData(10);
      moveEl(newData, 6, 2);
      const par = parent(oldNodes);
      makeChildrenEqualKeyed(par, newData, x => x, 'id');

      assert(par.insertBefore.calledOnceWithExactly(oldNodes[findIndex(oldNodes, 7)], oldNodes[findIndex(oldNodes, 3)]));
      expectSameState(par.childNodes, newData);
    });

    it('swaps forward', () => {
      const oldData = buildData(10);
      const oldNodes = dataToChildNodes(oldData);
      const newData = buildData(10);
      moveEl(newData, 3, 7);
      const par = parent(oldNodes);
      makeChildrenEqualKeyed(par, newData, undefined, 'id');

      assert(par.insertBefore.calledOnceWithExactly(oldNodes[findIndex(oldNodes, 4)], oldNodes[findIndex(oldNodes, 9)]));
      expectSameState(par.childNodes, newData);
    });

    it('swaps forward and backward', () => {
      const oldData = buildData(10);
      const oldNodes = dataToChildNodes(oldData);
      const newData = buildData(10);
      moveEl(newData, 3, 7);
      moveEl(newData, 8, 3);
      const par = parent(oldNodes);
      makeChildrenEqualKeyed(par, newData, undefined, 'id');

      assert(par.insertBefore.calledTwice);
      assert(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 9)], oldNodes[findIndex(oldNodes, 4)]));
      assert(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 4)], oldNodes[findIndex(oldNodes, 10)]));
      expectSameState(par.childNodes, newData);
    });

    it('swaps forward and backward multiple', () => {
      const oldData = buildData(10);
      const oldNodes = dataToChildNodes(oldData);
      const newData = buildData(10);
      moveEl(newData, 2, 8);
      moveEl(newData, 9, 2);
      moveEl(newData, 4, 6);
      moveEl(newData, 7, 4);
      const par = parent(oldNodes);
      makeChildrenEqualKeyed(par, newData, undefined, 'id');

      assert.equal(par.insertBefore.callCount, 4);
      assert(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 10)], oldNodes[findIndex(oldNodes, 3)]));
      assert(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 3)], undefined));
      assert(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 8)], oldNodes[findIndex(oldNodes, 5)]));
      assert(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 5)], oldNodes[findIndex(oldNodes, 9)]));
      expectSameState(par.childNodes, newData);
    });

    it('swaps forward last element', () => {
      const oldData = buildData(10);
      const oldNodes = dataToChildNodes(oldData);
      const newData = buildData(10);
      moveEl(newData, 3, 9);
      const par = parent(oldNodes);
      makeChildrenEqualKeyed(par, newData, undefined, 'id');

      assert(par.insertBefore.calledOnceWithExactly(oldNodes[findIndex(oldNodes, 4)], undefined));
      expectSameState(par.childNodes, newData);
    });

    it('shrinks', () => {
      const oldData = buildData(10);
      const oldNodes = dataToChildNodes(oldData);
      const removed = oldNodes[9];
      const newData = buildData(9);
      const par = parent(oldNodes);
      makeChildrenEqualKeyed(par, newData, undefined, 'id');

      assert(par.removeChild.calledOnceWithExactly(removed));
      expectSameState(par.childNodes, newData);
    });

    it('adds', () => {
      const oldData = buildData(10);
      const newData = buildData(11);
      const added = dataToChildNodes([newData[10]])[0];
      const par = parent(dataToChildNodes(oldData));
      makeChildrenEqualKeyed(par, newData, () => { return added; }, 'id');

      assert(par.appendChild.calledOnce);
      assert(par.appendChild.calledOnceWithExactly(added));
      expectSameState(par.childNodes, newData);
    });

    it('rearranges', () => {
      const oldData = buildData(10);
      const oldNodes = dataToChildNodes(oldData);
      const newData = buildData(10);
      moveEl(newData, 3, 7);
      moveEl(newData, 4, 9);
      moveEl(newData, 1, 3);
      moveEl(newData, 8, 2);
      moveEl(newData, 0, 2);
      const par = parent(oldNodes);
      makeChildrenEqualKeyed(par, newData, undefined, 'id');

      assert.equal(par.insertBefore.callCount, 5);
      assert.equal(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 6)], oldNodes[findIndex(oldNodes, 10)]), true);
      assert.equal(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 4)], oldNodes[findIndex(oldNodes, 9)]), true);
      assert.equal(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 5)], oldNodes[findIndex(oldNodes, 2)]), true);
      assert.equal(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 10)], oldNodes[findIndex(oldNodes, 1)]), true);
      assert.equal(par.insertBefore.calledWith(oldNodes[findIndex(oldNodes, 3)], oldNodes[findIndex(oldNodes, 10)]), true);
      expectSameState(par.childNodes, newData);
    });
  });
});
