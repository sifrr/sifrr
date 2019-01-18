const check = require('../../../src/utils/check');

describe('Check', () => {
  before(() => {
    sinon.stub(process, 'exit');
    sinon.stub(process.stderr, 'write');
  });

  after(() => {
    sinon.restore();
  });

  it('show error and exit 1 for bad command', () => {
    check('rasjaskdasdsad', 'Error');
    assert(process.stderr.write.calledWith('Error'));
    assert(process.exit.calledWith(1));
  });

  it("doesn't show error and exit 1 for bad command", () => {
    expect(check('node -v', 'Error', false)).to.be.true;
  });
});
