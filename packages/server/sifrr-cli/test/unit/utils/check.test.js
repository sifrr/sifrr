const check = require('../../../src/utils/check');

describe('Check', () => {
  it('show error and exit 1 for bad command', () => {
    expect(check('rasjaskdasdsad', 'Error', false)).to.be.false;
  });

  it("doesn't show error and exit 1 for bad command", () => {
    expect(check('yarn -v', 'Error', false)).to.be.true;
  });
});
