const { nativeToSyntheticEvent } = require('../../../src/dom/event');

describe('Event', () => {
  it('takes composedPath if exists', async () => {
    const target = {
      _click: sinon.spy()
    };
    const event = {
      composedPath: () => [target]
    };
    await nativeToSyntheticEvent(event, 'click');

    assert(target._click.calledOnce);
  });
});
