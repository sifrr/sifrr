const createFile = require('../../../src/utils/createfile');
const exec = require('child_process').execSync;

describe('Create File', () => {
  before(() => {
    sinon.stub(process, 'exit');
    sinon.stub(process.stderr, 'write');
  });

  afterEach(() => {
    exec('if [ -f ./test.txt ]; then rm ./test.txt; fi');
  });

  after(() => {
    sinon.restore();
  });

  it('creates file when it is not present', () => {
    expect(createFile(path.resolve('./test.txt'), 'Abcd')).to.be.true;
  });

  it("doesn't create file when it is present", () => {
    createFile(path.resolve('./test.txt'), 'Mnop');
    createFile(path.resolve('./test.txt'), 'Abcd');
    assert(process.stderr.write.calledWith(`File already exists at ${path.resolve('./test.txt')}`));
    assert(process.exit.calledWith(1));
  });

  it('creates file when it is present and forced', () => {
    createFile(path.resolve('./test.txt'), 'Abcd');
    expect(createFile(path.resolve('./test.txt'), 'Abcdefgh', true)).to.be.true;
  });
});
