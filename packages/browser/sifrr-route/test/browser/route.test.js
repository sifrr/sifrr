const ACTIVE_CLASS = 'active';

async function isActive(selector) {
  const className = await page.$eval(selector, el => el.className);
  return className.indexOf(ACTIVE_CLASS) >= 0;
}

describe('sifrr-route', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
  });

  it('has `Sifrr.Dom.html`', async () => {
    const type = await page.evaluate(() => typeof Sifrr.Dom.html);

    expect(type).to.equal('function');
  });

  it('makes el active on refresh if it test is true', async () => {
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

  it('refreshes once when a link is click', async () => {
    await page.$eval('#test', el => {
      el.i = 0;
      el.refresh = () => el.i = el.i + 1;
    });
    await page.click('a[href="/abcd"]');

    assert.equal(await page.$eval('#test', el => el.i), 1);
  });

  it('refreshes once when data-sifrr-path is changed', async () => {
    await page.$eval('#test', el => {
      el.i = 0;
      el.refresh = () => el.i = el.i + 1;
      el.dataset.sifrrPath = '/ancd';
    });

    assert.equal(await page.$eval('#test', el => el.i), 1);
  });

  it('changes title when clicked on a link', async () => {
    await page.goto(`${PATH}/`);
    await page.click('a[href="/abcd"]');

    expect(await page.title()).to.be.equal('abcd');
  });

  it('doesn\'t reload when clicked on a link without target', async () => {
    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.i = 1);
    await page.click('a[href="/abcd"]');

    expect(page.url()).to.equal(`${PATH}/abcd`);
    expect(await page.$eval('#complexlink', el => el.i)).to.equal(1);
  });

  it('reloads when clicked on a link with target not equal to _self', async () => {
    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.i = 2);
    await page.click('a[target="_self"]');

    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.equal(2);

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.i = 3);
    await page.click('a[target="_blank"]');

    expect(page.url()).to.not.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.equal(3);

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.i = 4);
    await page.click('a[target="_top"]');

    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.not.equal(4);

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.i = 5);
    await page.click('a[target="_parent"]');

    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.i)).to.not.equal(5);
  });

  it('opens in new tab when clicked with control key', async () => {
    const oldP = (await browser.current.pages()).length;
    await page.keyboard.down('Meta');
    await page.click('a[target="_self"]');
    await page.keyboard.up('Meta');
    const newP = (await browser.current.pages()).length;

    // assert.equal(newP - oldP, 1);
  });

  it('changes routes when clicked on back/forward button', async () => {
    await page.goto(`${PATH}/`);
    await page.goto(`${PATH}/abcd`);

    expect(await isActive('#abcd')).to.be.true;

    await page.goBack();

    expect(await isActive('#abcd')).to.be.false;

    await page.goForward();

    expect(await isActive('#abcd')).to.be.true;
  });

  it('doesn\'t reload when clicking back/forward', async () => {
    await page.goto(`${PATH}/`);
    await page.click('a[href="/abcd"]');
    await page.$eval('#complexlink', el => el.i = 11);
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
      star: [
        'def',
        'sdf'
      ],
      '*': [
        'def',
        'sdf'
      ],
      doubleStar: [
        'ghi/klm'
      ],
      '**': [
        'ghi/klm'
      ]
    });
  });

  it('passes state to data-sifrr-route-state=true', async () => {
    await page.click('#complexlink');
    const routeState = await page.$eval('#complex', el => el.state);
    const childState = await page.$eval('#complex sifrr-test', el => el.state);

    expect(childState.route).to.deep.equal(routeState);
  });
});
