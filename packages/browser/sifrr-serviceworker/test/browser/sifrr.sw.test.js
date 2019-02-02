function stubRequests() {
  page.on('request', request => {
    if (page.__post) {
      request.continue({ method: 'POST' });
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
    const resp = await page.goto(`${PATH}/index.html`);

    assert(resp.fromServiceWorker());
  });

  it('only response with sw when method is GET', async () => {
    // Test when stubbing starts working on puppeteer
    page.__post = true;

    const response = await page.goto(`${PATH}/index.html`);

    assert.equal(response.fromServiceWorker(), false);

    page.__post = false;
  });

  it('shows push notification on payload', async () => {
    // [TODO]
    // Can't test till https://github.com/GoogleChrome/puppeteer/issues/3432
    // await page.evaluate(async () => await window.sendPush());
    // const notifications = await page.evaluate('(await navigator.serviceWorker.getRegistration()).getNotifications()');
  });

  it('has precached files in sw cache', async () => {
    const resp1 = await page.goto(`${PATH}/precache.js`);
    const resp2 = await page.goto(`${PATH}/cacheonly.js`);
    const resp3 = await page.goto(`${PATH}/networkonly.js`);

    assert(resp1.fromCache());
    assert(resp2.fromCache());
    assert.equal(resp3.fromCache(), false);
  });

  it('always gets network_only files from network', async () => {
    const resp1 = await page.goto(`${PATH}/networkonly.js`);
    const resp2 = await page.goto(`${PATH}/networkonly.js`);

    assert.equal(resp1.fromCache(), false);
    assert.equal(resp2.fromCache(), false);
  });

  it('gets network_first files from network when available', async () => {
    const resp1 = await page.goto(`${PATH}/networkfirst.js`);
    const resp2 = await page.goto(`${PATH}/networkfirst.js`);

    assert.equal(resp1.fromCache(), false);
    assert.equal(resp2.fromCache(), false);
  });

  it('gets from cache for network_first files when offline', async () => {
    // Should pass when offline starts working
    page.__offline = true;

    const resp2 = await page.goto(`${PATH}/networkfirst.js`);
    const respText2 = await resp2.text();

    page.__offline = false;

    expect(respText2).to.not.have.string('OFFLINE');
  });

  it('gets from cache for cache_first files after first request', async () => {
    const resp1 = await page.goto(`${PATH}/cachefirst.js`);
    const resp2 = await page.goto(`${PATH}/cachefirst.js`);

    assert.equal(resp1.fromCache(), false);
    assert(resp2.fromCache());
  });

  it('gets from cache for cache_and_update files after first request but updates cache', async () => {
    const resp1 = await page.goto(`${PATH}/cacheupdate.js`);
    const resp2 = await page.goto(`${PATH}/cacheupdate.js`);

    // [TODO]: Add test for updated cache

    assert.equal(resp1.fromCache(), false);
    assert(resp2.fromCache());
  });

  it('responds with assigned fallbacks when offline/not found', async () => {
    const respText = await (await page.goto(`${PATH}/status404`)).text();

    expect(respText).to.have.string('OFFLINE');
  });

  it('responds not ok for non cached files with no assigned fallbacks when offline/not found', async () => {
    const respText = await (await page.goto(`${PATH}/abcd404`)).text();

    expect(respText).to.have.string('Not Found');
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

  it('saves in default cache', async () => {
    const resp = await page.goto(`${PATH}/?sw2.bundled.js`);
    assert(resp.fromServiceWorker());
  });
});
