describe('twowaybind', () => {
  it('takes composedPath if exists', () => {
    const twoWayBind = require('../../../src/dom/twowaybind');

    const target = {
      _root: { state: {}, _state: {}, isSifrr: true },
      hasAttribute: () => true,
      getAttribute: () => 'stt',
      value: 'value'
    };
    const event = {
      composedPath: () => [target]
    };
    twoWayBind(event);

    assert.equal(target._root.state.stt, 'value');
  });
});
