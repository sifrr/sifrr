import { BIND_PROP } from '../../../src/dom/constants';

describe('twowaybind', () => {
  it('takes composedPath if exists', () => {
    const twoWayBind = require('../../../src/dom/twowaybind').default;

    const target = {
      _root: {
        state: {},
        isSifrr: true,
        setState: function(v) {
          Object.assign(this.state, v);
        }
      },
      [BIND_PROP]: 'stt',
      value: 'value'
    };
    const event = {
      composedPath: () => [target]
    };
    twoWayBind(event);

    assert.equal(target._root.state.stt, 'value');
  });
});
