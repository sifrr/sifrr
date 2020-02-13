const mock = require('mock-require');
const spy = sinon.spy();

spy.lastArgs = () => spy.args[spy.args.length - 1][0];

describe('element:generate', () => {
  before(() => {
    mock('../../../src/commands/elementgenerate', spy);
  });

  after(() => {
    mock.stop('../../../src/commands/elementgenerate');
  });

  afterEach(() => {
    const cli = require.resolve('../../../src/sifrr.cli');
    delete require.cache[cli];
    const yargs = require.resolve('yargs');
    delete require.cache[yargs];
  });

  it('provides default options', () => {
    process.argv = ['node', 'sifrr', 'element:generate', 'new-element'];

    require('../../../src/sifrr.cli');
    const args = spy.lastArgs();

    assert(spy.called);
    expect(args.name).to.eq('new-element');
    expect(args.force).to.eq(false);
    expect(args.path).to.eq('./public/elements');
  });

  it('provides path', () => {
    process.argv = ['node', 'sifrr', 'element:generate', 'random-element', '--path', '/randomPath'];

    require('../../../src/sifrr.cli');
    const args = spy.lastArgs();

    expect(args.path).to.eq('/randomPath');
  });

  it('provides force', () => {
    process.argv = ['node', 'sifrr', 'element:generate', 'random-element', '--force', 'true'];

    require('../../../src/sifrr.cli');
    const args = spy.lastArgs();

    expect(args.force).to.eq('true');
  });

  it('provides extends', () => {
    process.argv = [
      'node',
      'sifrr',
      'element:generate',
      'random-element',
      '--extends',
      'HTMLElemet'
    ];

    require('../../../src/sifrr.cli');
    const args = spy.lastArgs();

    expect(args.extends).to.eq('HTMLElemet');
  });
});
