const mock = require('mock-require');

describe('Parser', () => {
  it('twowaybind takes composedPath if exists', () => {
    mock('../../../src/dom/ref', {});
    mock('../../../src/dom/creator', {});
    const { twoWayBind } = require('../../../src/dom/parser');

    const target = {
      _root: { state: {} },
      hasAttribute: () => true,
      getAttribute: () => 'stt',
      value: 'value'
    };
    const event = {
      composedPath: () => [target]
    };
    twoWayBind(event);

    assert.equal(target._root.state.stt, 'value');

    mock.stopAll();
  });
});
