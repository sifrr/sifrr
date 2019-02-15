let client, windowId;
async function getListeners(type = '') {
  return (await client.send('DOMDebugger.getEventListeners', { objectId: windowId })).listeners.filter(l => l.type.indexOf(type) >= 0);
}

describe('Sifrr.Dom.Event', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
    client = await page.target().createCDPSession();
    windowId = (await client.send('Runtime.evaluate', { expression: 'window' })).result.objectId;
  });

  it('adds event listener on .add', async () => {
    await page.evaluate(() => {
      Sifrr.Dom.Event.add('click');
    });
    const listeners = await getListeners('click');

    assert.equal(listeners.length, 1);
    assert.equal(listeners[0].useCapture, true);
    assert.equal(listeners[0].passive, true);
    assert.equal(listeners[0].once, false);

    await page.evaluate(() => {
      Sifrr.Dom.Event.add('click');
    });
    const listeners2 = await getListeners('click');
    assert.equal(listeners2.length, 1, 'should not add listener again');
  });

  it('works with _event properties', async () => {
    const ret = await page.$eval('a', el => {
      let i = 0, sameEl = false;
      el._click = (e, target) => {
        sameEl = target === el;
        i++;
      };
      el.click();
      return [i, sameEl];
    });

    assert.equal(ret[0], 1);
    assert.equal(ret[1], true);
  });

  it('works with _event attribute', async () => {
    const ret = await page.$eval('a', el => {
      el._click = undefined;
      let i = 0, sameEl, ev;
      // eslint-disable-next-line no-unused-vars
      window.clickEvent = (e, target) => {
        ev = !!e;
        sameEl = target === el;
        i++;
      };
      el.setAttribute('_click', 'clickEvent(event, target)');
      el.click();
      return { i, sameEl, ev };
    });

    assert.equal(ret.i, 1);
    assert.equal(ret.sameEl, true);
    assert.equal(ret.ev, true);
  });

  it('works with addListener', async () => {
    const ret = await page.evaluate(() => {
      Sifrr.Dom.Event.addListener('click', '.ok', (event, target) => {
        target.i = (target.i || 0) + 1;
      });
      document.querySelector('a.ok').click();
      document.querySelector('div.ok').click();
      return [document.querySelector('a.ok').i, document.querySelector('div.ok').i];
    });

    assert.equal(ret[0], 1);
    assert.equal(ret[1], 1);
  });

  it("doesn't add two same listeners", async () => {
    const ret = await page.evaluate(() => {
      let i = 0;
      function listener() {
        i++;
      }
      Sifrr.Dom.Event.addListener('click', '.ok', listener);
      Sifrr.Dom.Event.addListener('click', '.ok', listener);
      document.querySelector('a.ok').click();
      return i;
    });

    assert.equal(ret, 1);
  });

  it('works with removeListener', async () => {
    const ret = await page.evaluate(() => {
      let i = 0;
      function listener() {
        i++;
      }
      Sifrr.Dom.Event.addListener('click', '.ok', listener);
      document.querySelector('a.ok').click();
      Sifrr.Dom.Event.removeListener('click', '.ok', listener);
      document.querySelector('a.ok').click();
      return i;
    });

    assert.equal(ret, 1);
  });

  it("doesn't throw error if removeListener is called for listener that doesn't exist", async () => {
    const ret = await page.evaluate(() => {
      try {
        Sifrr.Dom.Event.removeListener('click', '.bang', () => {}); // Should not do anything for
        return true;
      } catch(e) {
        return false;
      }
    });

    assert.equal(ret, true);
  });

  it('works with trigger', async () => {
    const ret = await page.evaluate(() => {
      let i = 0;
      Sifrr.Dom.Event.add('randomevent');
      document.querySelector('a.ok')._randomevent = () => i++;
      Sifrr.Dom.Event.trigger('a.ok', 'randomevent');
      Sifrr.Dom.Event.trigger(document.querySelector('a.ok'), 'randomevent');
      return i;
    });

    assert.equal(ret, 2);
  });
});
