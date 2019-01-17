const createFile = require('../../../src/utils/createfile');
const exec = require('child_process').execSync;

describe('Create File', () => {
  beforeEach(() => {
    exec('if [ -f ./test.txt ]; then rm ./test.txt; fi');
  });

  after(() => {
    exec('if [ -f ./test.txt ]; then rm ./test.txt; fi');
  });

  it('creates file when it is not present', () => {
    expect(createFile(path.resolve('./test.txt'), 'Abcd')).to.be.true;
  });

  it("doesn't create file when it is present", () => {
    createFile(path.resolve('./test.txt'), 'Abcd');
    expect(createFile(path.resolve('./test.txt'), 'Abcd', false, false)).to.be.false;
  });

  it('creates file when it is present and forced', () => {
    createFile(path.resolve('./test.txt'), 'Abcd');
    expect(createFile(path.resolve('./test.txt'), 'Abcdefgh', true)).to.be.true;
  });
});
