async function testElement(elName, str) {
  expect(await page.evaluate((el) => typeof Sifrr.Dom.elements[el], elName)).to.eq('function');
  expect(await page.$eval(elName, el => el.shadowRoot.innerHTML)).to.have.string(str);
}

describe('Sifrr.Dom.load and Loader', () => {
  before(async () => {
    await page.goto(`${PATH}/loading.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('has all defined elements', async () => {
    await testElement('loading-load', 'Loading Load');
    await testElement('loading-loadjs', 'Loading Loadjs');
    await testElement('loading-src', 'Loading Src');
    await testElement('loading-custom', 'Loading Custom Url');
    await testElement('loading-custom2', 'Loading Custom Js');
    await testElement('loading-module', 'Loading Module');
    await testElement('loading-module2', 'Loading Module Import');
    await testElement('loading-separatejs', 'Loading Separate JS');
  });

  it("doesn't try to register element if it is already loaded", async () => {
    const error = await page.evaluate(() => {
      try {
        Sifrr.Dom.load('loading-load');
        return false;
      } catch(e) {
        return e.message;
      }
    });

    assert.equal(error, false);
  });

  it("doesn't try to run script element if it is already executed", async () => {
    const mes = await page.evaluate(() => {
      let mes;
      window.console.log = (e) => mes = e;
      (new Sifrr.Dom.Loader('loading-load')).executeScripts();
      return mes;
    });

    assert.equal(mes, "'loading-load' element's javascript was already executed");
  });

  it('consoles error from html scripts', async () => {
    const error = await page.evaluate(async () => {
      let e, trace;
      await Sifrr.Dom.load('loading-error').catch(err => {
        e = err.message;
        trace = err.stack;
      });
      return { e, trace };
    });

    expect(error.e).to.equal('loading error');
    expect(error.trace).to.have.string('/elements/loading/error.html');
  });

  it('throws error from js scripts', async () => {
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
});
