const { getEventListener } = require('../../../src/dom/event');

describe('Event', () => {
  it('takes composedPath if exists', async () => {
    const target = {
      click: sinon.spy()
    };
    const event = {
      composedPath: () => [target]
    };
    const nativeToSyntheticEvent = getEventListener('click');
    nativeToSyntheticEvent(event);

    assert(target._click.calledOnce);
  });
});
