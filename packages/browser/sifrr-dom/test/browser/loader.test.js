async function testElement(elName, str) {
  expect(await page.evaluate(el => typeof Sifrr.Dom.elements[el], elName)).to.eq(
    'function',
    elName
  );
  expect(await page.$eval(elName, el => el.shadowRoot.innerHTML)).to.have.string(str);
}

describe('Sifrr.Dom.load and Loader', () => {
  before(async () => {
    await page.goto(`${PATH}/loading.html`);
    await page.evaluate(async () => {
      await Sifrr.Dom.loading();
    });
  });

  it('has all defined elements', async () => {
    await testElement('loading-loadjs', 'Loading Loadjs');
    await testElement('loading-src', 'Loading Src');
    await testElement('loading-custom', 'Loading Custom Js');
    await testElement('loading-module', 'Loading Module');
    await testElement('loading-module2', 'Loading Module Import');
  });

  it("doesn't try to register element if it is already loaded", async () => {
    const error = await page.evaluate(async () => {
      try {
        Sifrr.Dom.load('loading-loadjs');
        return false;
      } catch (e) {
        return e;
      }
    });

    assert.equal(error, false);
  });

  it("doesn't try to run script element if it is already executed", async () => {
    const mes = await page.evaluate(() =>
      new Sifrr.Dom.Loader('loading-loadjs').executeScripts().catch(e => e.message)
    );

    assert(!mes);
  });

  it('consoles error from js scripts', async () => {
    const error = await page.evaluate(async () => {
      let e, trace;
      window.console.error = err => {
        e = err.message;
        trace = err.stack;
      };
      await Sifrr.Dom.load('loading-err');
      return { e, trace };
    });

    expect(error.e).to.equal('loading error js');
    expect(error.trace).to.have.string('/elements/loading/err.js');
  });

  it('throws error if can not resolve url', async () => {
    const err = await page.evaluate(() =>
      Sifrr.Dom.load('loading-nonexisting').catch(e => e.message)
    );

    expect(err).to.equal(
      'Can not get url for element: loading-nonexisting. Provide url in load or set urls or url function in config.'
    );
  });

  it('resolves loading() if loading js fails', async () => {
    const loaded = await page.evaluate(async () => {
      await Sifrr.Dom.load('loading-some');
      return await Sifrr.Dom.loading();
    });

    assert(loaded.length === 0);
  });

  it("warns if script doesn't register element and resolves promise", async () => {
    const message = await page.evaluate(async () => {
      let message;
      window.console.warn = w => {
        message = w;
      };
      await Sifrr.Dom.load('loading-noregister');
      return message;
    });

    expect(message).to.equal(
      "Executing '/elements/loading/noregister.js' file didn't register the element with name 'loading-noregister'. Give correct name to 'load' or fix the file."
    );
  });
});
