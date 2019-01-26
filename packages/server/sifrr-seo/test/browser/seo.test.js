async function loadTime(page) {
  return page.evaluate(() => {
    return window.performance.timing.responseEnd - window.performance.timing.requestStart;
  });
}

// With sr are because of setting onRender option

describe('sifrr-seo', () => {
  describe('js disabled', () => {
    before(async () => {
      await page.setJavaScriptEnabled(false);
      await page.setUserAgent('Opera Mini');
      await page.goto(`${PATH}/`);
    });

    it('doesn\'t have sifrr when js disabled', async () => {
      const sifrr = await page.evaluate(() => typeof Sifrr);

      assert.equal(sifrr, 'undefined');
    });

    it('renders sifrr-test on server (with sr)', async () => {
      const html = await page.$eval('sifrr-test', el => el.innerHTML.trim());

      expect(html).to.have.string('<p>Simple element</p>');
      expect(html).to.have.string('<p>1</p>');
    });

    it('renders sifrr-test on server (without sr)', async () => {
      const html = await page.$eval('sifrr-nosr', el => el.innerHTML.trim());

      expect(html).to.have.string('<p>No shadow root</p>');
      expect(html).to.have.string('<p>2</p>');
    });
  });

  describe('js enabled', () => {
    before(async () => {
      await page.setJavaScriptEnabled(true);
      await page.setUserAgent('UC Browser');
      await page.goto(`${PATH}/`);
    });

    it('renders sifrr-test again locally (with sr)', async () => {
      const html = await page.$eval('sifrr-test', async el => {
        await customElements.whenDefined('sifrr-test');
        return el.shadowRoot.innerHTML;
      });

      expect(html).to.have.string('<p>Simple element</p>');
      expect(html).to.have.string('<p>1</p>');
    });

    it('renders sifrr-nosr again locally (without sr)', async () => {
      const html = await page.$eval('sifrr-nosr', async el => {
        await customElements.whenDefined('sifrr-nosr');
        return el.innerHTML;
      });

      expect(html).to.have.string('<p>No shadow root</p>');
      expect(html).to.have.string('<p>2</p>');
    });

    it('first render is slow, second is fast', async () => {
      const ltBefore = await loadTime(page);
      await page.setExtraHTTPHeaders({
        'x-user': 'bang'
      });
      const resp = await (await page.goto(`${PATH}/xuser`)).text();
      const ltAfter = await loadTime(page);

      assert.isAbove(ltAfter, 30, 'First render should take > 100ms');
      assert.isBelow(ltBefore, 30, 'Second render should take < 100ms');
      expect(resp).to.have.string('"x-user":"bang"', 'it should pass headers to render request');
    });

    it('/xuser', async () => {
      await page.goto(`${PATH}/xuser`);
      const ltBefore = await loadTime(page);
      await page.setExtraHTTPHeaders({
        'x-user': 'new'
      });
      const resp = await (await page.goto(`${PATH}/xuser`)).text();
      const ltAfter = await loadTime(page);

      assert.isAbove(ltAfter, 30, 'new x-user should render html again');
      assert.isBelow(ltBefore, 30, 'no render because it was cached in previous test');
      expect(resp).to.have.string('"x-user":"new"', 'it should pass headers to render request');
    });
  });

  describe('non html files', () => {
    it("doesn't render non html files", async () => {
      await page.goto(`${PATH}/index.js`, { waitUntil: 'load' });
      const html = await page.$eval('body', async el => {
        return el.innerHTML;
      });

      expect(html).to.not.have.string('@sifrr/seo');
    });
  });
});
