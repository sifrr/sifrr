async function loadTime(page) {
  return page.evaluate(() => {
    return window.performance.timing.responseEnd - window.performance.timing.requestStart;
  });
}

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
      await page.setUserAgent('Opera Mini');
      await page.goto(`${PATH}/`);
    });

    it('renders sifrr-test again locally (with sr)', async () => {
      const html1 = await page.$eval('sifrr-test', el => el.innerHTML.trim());
      const html2 = await page.$eval('sifrr-test', async el => {
        await customElements.whenDefined('sifrr-test');
        return el.shadowRoot.innerHTML;
      });

      expect(html1).to.have.string('<p>Simple element</p>');
      expect(html2).to.have.string('<p>Simple element</p>');
      expect(html1).to.have.string('<p>1</p>');
      expect(html2).to.have.string('<p>1</p>');
    });

    it('renders sifrr-test again locally (without sr)', async () => {
      const html = await page.$eval('sifrr-nosr', async el => {
        await customElements.whenDefined('sifrr-nosr');
        return el.innerHTML;
      });

      expect(html).to.have.string('<p>No shadow root</p>');
      expect(html).to.have.string('<p>2</p>');
    });

    it('first render is slow, second is fast', async () => {
      const ltBefore = await loadTime(page);
      await page.goto(`${PATH}/wuser`);
      const ltAfter = await loadTime(page);

      assert.isAbove(ltAfter, 500, 'First render should take > 500ms');
      assert.isBelow(ltBefore, 100, 'Second render should take < 100ms');
    });

    it('/xuser', async () => {
      await page.setExtraHTTPHeaders({
        'x-user': 'new'
      });
      const resp = await (await page.goto(`${PATH}/xuser`)).text();
      const lt = await loadTime(page);

      assert.isAbove(lt, 500, 'It should render xuser again because of new x-user header');
      expect(resp).to.have.string('"x-user":"new"', 'it should pass headers to render request');
    });
  });
});
