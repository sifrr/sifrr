const ACTIVE_CLASS = 'active';

async function isActive(selector) {
  const className = await page.$eval(selector, el => el.className);
  return className.indexOf(ACTIVE_CLASS) >= 0;
}

describe('sifrr-route', () => {
  before(async () => {
    await loadBrowser();
    await page.goto(`${PATH}/`);
  });

  after(async () => {
    await browser.close();
  });

  it('shows `**` everywhere', async () => {
    expect(await isActive('#everywhere')).to.be.true;
    await page.goto(`${PATH}/abcdasdsd`);
    expect(await isActive('#everywhere')).to.be.true;
  });

  it('shows `/abcd` only on /abcd', async () => {
    await page.goto(`${PATH}/asasddddddd`);
    expect(await isActive('#abcd')).to.be.false;
    await page.goto(`${PATH}/abcd`);
    expect(await isActive('#abcd')).to.be.true;
  });

  it('changes routes when clicked on an a', async () => {
    await page.goto(`${PATH}/`);
    expect(await isActive('#abcd')).to.be.false;
    await page.click('a[href="/abcd"]');
    expect(await isActive('#abcd')).to.be.true;
  });

  it('changes title when clicked on an a', async () => {
    await page.goto(`${PATH}/`);
    await page.click('a[href="/abcd"]');
    expect(await page.title()).to.be.equal('abcd');
  });

  it('doesn\'t reload when clicked on an a without target', async () => {
    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.textContent = 'new text');
    await page.click('a[href="/abcd"]');
    expect(page.url()).to.equal(`${PATH}/abcd`);
    expect(await page.$eval('#complexlink', el => el.textContent)).to.equal('new text');
  });

  it('reloads when clicked on an a with target not equal to _self', async () => {
    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.textContent = 'new text');
    await page.click('a[target="_self"]');
    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.textContent)).to.equal('new text');

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.textContent = 'new text');
    await page.click('a[target="_blank"]');
    expect(page.url()).to.not.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.textContent)).to.equal('new text');

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.textContent = 'new text');
    await page.click('a[target="_top"]');
    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.textContent)).to.not.equal('new text');

    await page.goto(`${PATH}/`);
    await page.$eval('#complexlink', el => el.textContent = 'new text');
    await page.click('a[target="_parent"]');
    expect(page.url()).to.equal(`${PATH}/target`);
    expect(await page.$eval('#complexlink', el => el.textContent)).to.not.equal('new text');
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
    await page.$eval('#complexlink', el => el.textContent = 'new text');
    await page.goBack();
    expect(page.url()).to.equal(`${PATH}/`);
    expect(await page.$eval('#complexlink', el => el.textContent)).to.equal('new text');
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
      doubleStar: [
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
