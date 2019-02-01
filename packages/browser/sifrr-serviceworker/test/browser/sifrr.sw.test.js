function stubRequests() {
  page.on('request', request => {
    request.continue();
    if (page.__offline === false) {
      request.abort();
    } else {
      request.continue();
    }
  });
}

describe('sifrr-serviceworker', () => {
  before(async () => {
    // Doesn't work because of https://github.com/GoogleChrome/puppeteer/issues/3715
    // await page.setRequestInterception(true);
    // stubRequests();
    await page.goto(`${PATH}/`);
    await page.evaluate('navigator.serviceWorker.ready');
  });

  after(async () => {
  });

  it('registers service worker', async () => {
    // wait for service worker ready
    const resp = await page.goto(`${PATH}/index.html`);

    assert.equal(resp.fromServiceWorker(), true);
  });

  it('has precached files in sw cache', async () => {
    const resp1 = await page.goto(`${PATH}/precache.js`);
    const resp2 = await page.goto(`${PATH}/cacheonly.js`);
    const resp3 = await page.goto(`${PATH}/networkonly.js`);

    assert.equal(resp1.fromCache(), true);
    assert.equal(resp2.fromCache(), true);
    assert.equal(resp3.fromCache(), false);
  });

  it('always gets network_only files from network', async () => {
    const resp1 = await page.goto(`${PATH}/networkonly.js`);
    const resp2 = await page.goto(`${PATH}/networkonly.js`);

    assert.equal(resp1.fromCache(), false);
    assert.equal(resp2.fromCache(), false);
  });

  it('gets from cache for cache_first files after first request', async () => {
    const resp1 = await page.goto(`${PATH}/cachefirst.js`);
    const resp2 = await page.goto(`${PATH}/cachefirst.js`);

    assert.equal(resp1.fromCache(), false);
    assert.equal(resp2.fromCache(), true);
  });

  // can't test these before https://github.com/GoogleChrome/puppeteer/issues/2469 is solved
  it('responds non cached files with assigned fallbacks when offline', async () => {
    page.__offline = true;

    const resp = await page.goto(`${PATH}/networkonly.js`);
    const respText = await resp.text();

    page.__offline = false;

    // expect(respText.indexOf('OFFLINE') >= 0).to.be.true;
  });

  it('responds not ok for non cached files with no assigned fallbacks when offline', async () => {
    await page.setOfflineMode(true);

    const resp = await page.goto(`${PATH}/server.js`);

    await page.setOfflineMode(false);

    // expect(resp.ok()).to.be.false;
  });

  it('gets from cache for network_first files when offline', async () => {
    const resp1 = await page.goto(`${PATH}/networkfirst.js`);
    const respText1 = await resp1.text();

    await page.setOfflineMode(true);

    const resp2 = await page.goto(`${PATH}/networkfirst.js`);
    const respText2 = await resp2.text();

    await page.setOfflineMode(false);

    assert.equal(respText1, respText2);
  });

  it('throws error for network_only files when offline', async () => {
    const resp1 = await page.goto(`${PATH}/networkonly.js`);
    const respText1 = await resp1.text();

    await page.setOfflineMode(true);

    const resp2 = await page.goto(`${PATH}/networkonly.js`);
    const respText2 = await resp2.text();

    await page.setOfflineMode(false);

    // assert.notEqual(respText1, respText2);
  });

  it('deletes old cache versions when version is changed', async () => {
    await page.goto(`${PATH}/`);
    await page.evaluate(async () => {
      async function checkSW() {
        const sw = (await navigator.serviceWorker.getRegistration()).active;
        if(sw.scriptURL.indexOf('sw.bundled.js') < 0 || sw.state !== 'activated') {
          return new Promise(res => {
            window.setTimeout(() => res(checkSW()), 100);
          });
        } else {
          return;
        }
      }
      return await checkSW();
    });
    const caches = await page.evaluate("window.send_message_to_sw('caches')");

    await page.goto(`${PATH}/?sw2.bundled.js`);
    await page.evaluate(async () => {
      async function checkSW() {
        const sw = (await navigator.serviceWorker.getRegistration()).active;
        if(sw.scriptURL.indexOf('sw2.bundled.js') < 0 || sw.state !== 'activated') {
          return new Promise(res => {
            window.setTimeout(() => res(checkSW()), 100);
          });
        } else {
          return;
        }
      }
      return await checkSW();
    });
    const cachesNew = await page.evaluate("window.send_message_to_sw('caches')");

    caches.forEach((k) => {
      expect(cachesNew).to.not.include(k);
    });
  });
});
