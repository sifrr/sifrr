/* eslint-disable max-lines */
describe('Sifrr.Dom.Element', () => {
  before(async () => {
    await page.goto(`${PATH}/element.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('extends HTMLElement by default', async () => {
    const isHTMLElement = await page.evaluate(() => document.createElement('element-html') instanceof HTMLElement);

    assert.equal(isHTMLElement, true);
  });

  it('extends given Element class', async () => {
    const isDivElement = await page.evaluate(() => document.createElement('div', { is: 'element-div' }) instanceof HTMLDivElement);

    assert.equal(isDivElement, true);
  });

  it("doesn't add shadowRoot to empty element", async () => {
    const res = await page.$eval('element-empty', (el) => {
      return {
        isSifrr: el.isSifrr(),
        shadowRoot: !!el.shadowRoot
      };
    });

    expect(res).to.deep.equal({
      isSifrr: true,
      shadowRoot: false
    });
  });

  describe('connect', () => {
    it('calls onConnect', async () => {
      const res = await page.evaluate(() => {
        let i = 0;
        const el = document.createElement('element-empty');
        el.onConnect = () => i++;
        document.body.appendChild(el);
        return i;
      });

      assert.equal(res, 1);
    });
  });

  describe('attributes', () => {
    it('calls onAttributeChange for observed attributes', async () => {
      const res = await page.evaluate(() => {
        let name, old, newv, i = 0;
        const el = document.createElement('element-attrs');
        el.onAttributeChange = (nam, o, n) => {
          name = nam;
          old = o;
          newv = n;
          i++;
        };
        el.setAttribute('custom-attr', 'oldValue');
        el.setAttribute('custom-attr', 'newValue');
        return { name, old, newv, i };
      });

      expect(res).to.deep.equal({
        name: 'custom-attr',
        old: 'oldValue',
        newv: 'newValue',
        i: 2
      });
    });
  });

  describe('states', () => {
    it('works without defaultState', async () => {
      const srhtml = await page.$eval('element-nods-sr', el => el.shadowRoot.innerHTML);
      const nosrhtml = await page.$eval('element-nods-nosr', el => el.innerHTML);

      assert.equal(srhtml, '<p>Sifrr  Simple</p>');
      assert.equal(nosrhtml, '<p>Sifrr  Simple</p>');
    });

    it('works with defaultState', async () => {
      const srhtml = await page.$eval('element-ds-sr', el => el.shadowRoot.innerHTML);
      const nosrhtml = await page.$eval('element-ds-nosr', el => el.innerHTML);

      assert.equal(srhtml, '<p>Sifrr ok Simple</p>');
      assert.equal(nosrhtml, '<p>Sifrr ok Simple</p>');
    });

    it('works with programmatic state', async () => {
      const srhtml = await page.$eval('element-ps-sr', el => el.shadowRoot.innerHTML);
      const nosrhtml = await page.$eval('element-ps-nosr', el => el.innerHTML);

      assert.equal(srhtml, '<p>Sifrr ps Simple</p>');
      assert.equal(nosrhtml, '<p>Sifrr ps Simple</p>');
    });

    it('works with attribute state', async () => {
      const srhtml = await page.$eval('element-as-sr', el => el.shadowRoot.innerHTML);
      const nosrhtml = await page.$eval('element-as-nosr', el => el.innerHTML);

      assert.equal(srhtml, '<p>Sifrr as Simple</p>');
      assert.equal(nosrhtml, '<p>Sifrr as Simple</p>');
    });

    it('updates only once on connect', async () => {
      const res = await page.evaluate(() => {
        const types = [
            'element-nods',
            'element-ds',
            'element-ps',
            'element-as'
          ], result = {};

        types.forEach(t => {
          result[t + '-sr'] = document.querySelector(t + '-sr').updateCount;
          result[t + '-nosr'] = document.querySelector(t + '-nosr').updateCount;
        });

        return result;
      });

      assert.equal(Object.keys(res).length, 8);
      for (let el in res) {
        assert.equal(res[el], 1, el);
      }
    });
  });

  describe('disconnect', () => {
    it('calls onDisconnect', async () => {
      const res = await page.evaluate(() => {
        let i = 0;
        const el = document.createElement('element-empty');
        document.body.appendChild(el);
        el.onDisconnect = () => i++;
        const before = i;
        el.remove();
        return { before, after: i };
      });

      assert.equal(res.before, 0);
      assert.equal(res.after, 1);
    });
  });

  describe('state', () => {
    it('merges old and new states', async () => {
      const state = await page.evaluate(() => {
        const el = document.createElement('element-nods-sr');
        el.setState({  a: 'b'  });
        el.setState({  c: 'd'  });
        return el.state;
      });

      expect(state).to.deep.equal({
        a: 'b',
        c: 'd'
      });
    });
  });

  describe('clearState', () => {
    it('clears state', async () => {
      const state = await page.evaluate(() => {
        const el = document.createElement('element-nods-sr');
        el.setState({  a: 'b'  });
        el.clearState();
        return el.state;
      });

      expect(state).to.deep.equal({});
    });
  });

  describe('isSifrr', () => {
    it('returns true if no argument given', async () => {
      const isSifrr = await page.evaluate(() => {
        const el = document.createElement('element-nods-sr');
        return el.isSifrr();
      });

      assert.equal(isSifrr, true);
    });

    it('returns true if correct element given', async () => {
      const isSifrr = await page.evaluate(() => {
        const el = document.createElement('element-nods-sr');
        return { correct: el.isSifrr('element-nods-sr'), incorrect: el.isSifrr('wrong-name') };
      });

      assert.equal(isSifrr.correct, true);
      assert.equal(isSifrr.incorrect, false);
    });
  });

  describe('selectors', () => {
    it('$ selects one element', async () => {
      const res = await page.evaluate(() => {
        return {
          sr: document.querySelector('element-sel-sr').$('p').nodeName,
          nosr: document.querySelector('element-sel-nosr').$('p').nodeName
        };
      });

      expect(res).to.deep.equal({
        sr: 'P',
        nosr: 'P'
      });
    });

    it('$ selects all elements', async () => {
      const res = await page.evaluate(() => {
        return {
          sr: document.querySelector('element-sel-sr').$$('.ok').length,
          nosr: document.querySelector('element-sel-nosr').$$('.ok').length
        };
      });

      expect(res).to.deep.equal({
        sr: 2,
        nosr: 2
      });
    });
  });
});
