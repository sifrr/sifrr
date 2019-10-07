async function isActive(selector) {
  return await page.$eval(selector, async el => el.renderIf);
}

describe('sifrr-route', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
    await page.evaluate(async () => {
      await Sifrr.Dom.loading();
    });
  });

  it('has Sifrr.Route', async () => {
    const element = await page.evaluate(() => typeof Sifrr.Route.SifrrRoute);
    const regex = await page.evaluate(() => typeof Sifrr.Route.RegexPath);

    expect(element).to.equal('function');
    expect(regex).to.equal('function');
  });

  it('makes el active on refresh if regex test is true', async () => {
    await page.$eval('#test', el => {
      el.routeRegex.test = () => {
        return { match: true };
      };
      el.refresh();
    });

    expect(await isActive('#test')).to.be.true;

    await page.$eval('#test', el => {
      el.routeRegex.test = () => {
        return { match: false };
      };
      el.refresh();
    });

    expect(await isActive('#test')).to.be.false;
  });

  it('refreshes at start (active at start when route matches)', async () => {
    await page.goto(`${PATH}/abcd`);
    expect(await isActive('#abcd')).to.be.true;
  });

  it("refreshes once when a link is click and doesn't if somewhere else is click", async () => {
    await page.$eval('#test', el => {
      el.i = 0;
      el.refresh = () => (el.i = el.i + 1);
    });
    await page.click('a[href="/abcd"]');
    await page.click('h1');

    assert.equal(await page.$eval('#test', el => el.i), 1);
  });

  it("doesn't refresh if same link is clicked", async () => {
    await page.click('a[href="/abcd"]');
    await page.$eval('#test', el => {
      el.i = 0;
      el.refresh = () => (el.i = el.i + 1);
    });
    await page.click('a[href="/abcd"]');

    assert.equal(await page.$eval('#test', el => el.i), 0);

    await page.click('a[href="/abcd?query=random"]');

    assert.equal(await page.$eval('#test', el => el.i), 0);

    await page.click('a[href="/abcd#hash_random"]');

    assert.equal(await page.$eval('#test', el => el.i), 0);
  });

  it('refreshes once when path is changed', async () => {
    await page.goto(`${PATH}/`);

    expect(await isActive('#test')).to.be.true;

    await page.$eval('#test', el => el.setAttribute('path', '/abcd'));

    expect(await isActive('#test')).to.be.false;
  });

  it('changes title when clicked on a link and first title when title is not present', async () => {
    await page.click('a[href="/abcd"]');

    expect(await page.title()).to.be.equal('abcd');

    await page.click('a[href="/notitle"]');

    expect(await page.title()).to.be.equal('route');
  });

  it("doesn't reload when clicked on a link without target", async () => {
    await page.$eval('#complexlink', el => (el.i = 1));
    await page.click('a[href="/abcd"]');

    expect(page.url()).to.equal(`${PATH}/abcd`);
    expect(await page.$eval('#complexlink', el => el.i)).to.equal(1);
  });

  it('reloads when clicked on a link with target not equal to _self', async () => {
    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => (el.i = 2));
    await page.click('a[target="_self"]');

    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.equal(2);

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => (el.i = 3));
    await page.click('a[target="_blank"]');

    expect(page.url()).to.not.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.equal(3);

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => (el.i = 4));
    await page.click('a[target="_top"]');

    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.not.equal(4);

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => (el.i = 5));
    await Promise.all([page.waitForNavigation(), page.click('a[target="_parent"]')]);

    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.not.equal(5);
  });

  it('reloads when clicked on a link with target has different host', async () => {
    expect(
      await page.evaluate(() => window.location.protocol + '//' + window.location.host)
    ).to.equal(PATH);

    await Promise.all([page.waitForNavigation(), page.click('a#external')]);

    expect(
      await page.evaluate(() => window.location.protocol + '//' + window.location.host)
    ).to.not.equal(PATH);

    await page.goto(`${PATH}/`);
  });

  it('opens in new tab when clicked with control key', async () => {
    const oldP = (await browser.pages()).length;
    // Not working in macOS
    await page.keyboard.down('Control');
    await page.click('a[target="_self"]');
    await page.keyboard.up('Control');
    const newP = (await browser.pages()).length;

    // assert.equal(newP - oldP, 1);
  });

  it('changes routes when clicked on back/forward button', async () => {
    await page.click('a[href="/abcd"]');

    expect(await isActive('#abcd')).to.be.true;
    expect(await page.title()).to.equal('abcd');

    await page.goBack();

    expect(await isActive('#abcd')).to.be.false;
    expect(await page.title()).to.equal('route');

    await page.goForward();

    expect(await isActive('#abcd')).to.be.true;
    expect(await page.title()).to.equal('abcd');
  });

  it("doesn't reload when clicking back/forward", async () => {
    await page.goto(`${PATH}/`);
    await page.click('a[href="/abcd"]');
    await page.$eval('#complexlink', el => (el.i = 11));
    await page.goBack();

    expect(page.url()).to.equal(`${PATH}/`);
    expect(await page.$eval('#complexlink', el => el.i)).to.equal(11);
  });

  it('parses state from url', async () => {
    await page.click('#complexlink');
    const state = await page.$eval('#complex', el => el.state);

    expect(state).to.deep.equal({
      x: 'new',
      k: 'klm',
      '*': ['def', 'sdf'],
      '**': ['ghi/klm']
    });
  });

  it('passes state to data-sifrr-route-state=true', async () => {
    await page.click('#complexlink');
    const routeState = await page.$eval('#complex', el => el.state);
    const childState = await page.$eval('#complex sifrr-test', el => el.state);

    expect(childState.route).to.deep.equal(routeState);
  });

  // keep in end
  it('loads sifrr elements required', async () => {
    await page.evaluate(() => {
      window.loadedEls = {};
      Sifrr.Dom.load = (k, o = {}) => (window.loadedEls[k] = o);
    });
    await page.click('#elementSimple');
    expect(await page.evaluate(() => window.loadedEls)).to.deep.equal({
      'sifrr-a': {},
      'sifrr-b': {}
    });

    await page.evaluate(() => (window.loadedEls = {}));
    await page.click('#elementJson');
    expect(await page.evaluate(() => window.loadedEls)).to.deep.equal({
      'sifrr-a': {},
      'sifrr-b': { js: true }
    });
  });
});
