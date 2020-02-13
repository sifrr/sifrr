const Path = require('path');
const mock = require('mock-require');
const spy = sinon.spy();
const stub = sinon.stub().returns('template');

describe('elementgenerate()', () => {
  before(() => {
    mock('../../../src/utils/createfile', spy);
    mock('../../../src/templates/element', stub);
  });

  after(() => {
    mock.stop('../../../src/utils/createfile');
    mock.stop('../../../src/templates/element');
  });

  it('passes given options to createFile', () => {
    const elementgenerate = require('../../../src/commands/elementgenerate').default;

    elementgenerate({
      name: 'element-name',
      path: './abcd',
      force: false,
      extends: 'random'
    });

    assert(stub.calledWith('ElementName', 'random'));
    assert(spy.calledWith(Path.resolve('./abcd', 'element/name.js'), 'template', false));
  });
});

describe('element template', () => {
  it('returns string', () => {
    expect(
      require('../../../src/templates/element').default('ElementName', 'HTMLNew')
    ).to.have.string('extends(HTMLNew)');
    expect(require('../../../src/templates/element').default('ElementName')).to.not.have.string(
      'extends:'
    );
  });
});
