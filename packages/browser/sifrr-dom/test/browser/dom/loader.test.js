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
      try {
        (new Sifrr.Dom.Loader('loading-load')).executeScripts();
      } catch (e) {
        mes = e.message;
      }
      return mes;
    });

    assert.equal(mes, "'loading-load' element's javascript was already executed");
  });

  it('throws error from html scripts', async () => {
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

  it('resolves loading() if both loading html and js fails', async () => {
    const loaded = await page.evaluate(async () => {
      await Sifrr.Dom.load('loading-nonexisting').catch(e => e);
      return await Sifrr.Dom.loading();
    });

    assert(loaded);
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

    expect(message).to.equal("Executing 'loading-noregister' file didn't register the element. Ignore if you are registering element in a promise or async function.");
  });

  it('does on progress in load', async () => {
    const per = await page.evaluate(async () => {
      let per;
      try {
        await Sifrr.Dom.load('main-element', { onProgress: (per) => { throw Error(per); } });
      } catch (e) {
        per = e.message;
      }
      return per;
    });

    expect(parseInt(per, 10)).to.be.at.most(100);
  });
});
