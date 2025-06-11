function getIds() {
  const nodes = document.body.$('#main-element').$$('tr'),
    l = nodes.length;
  const ret = [];
  for (let i = 0; i < l; i++) {
    ret.push(parseInt(nodes[i].$('td').firstChild.data));
  }
  return ret;
}

function getDataIds() {
  return window.DIV.data.map((d) => d.id);
}

describe('keyed', () => {
  beforeEach(async () => {
    await page.goto(`${PATH}/speedtest.html?useKey`);
  });

  it('rearranges swaps rows and not update them', async () => {
    await page.evaluate(() => document.body.$('#main-element').$('#run').click());
    await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 1000");

    await page.evaluate("var old2 = document.body.$('#main-element').$$('tr')[1]");
    await page.evaluate("var old998 = document.body.$('#main-element').$$('tr')[998]");

    await page.evaluate(() => document.body.$('#main-element').$('#swaprows').click());
    await page.waitForFunction(
      "document.body.$('#main-element').$$('tr')[1].$('td').textContent === '999'"
    );

    const same2 = await page.evaluate("old2 === document.body.$('#main-element').$$('tr')[998]");
    const same998 = await page.evaluate("old998 === document.body.$('#main-element').$$('tr')[1]");

    assert(same2);
    assert(same998);
  });

  it('deletes row and not update them and remove last one', async () => {
    await page.evaluate(() => document.body.$('#main-element').$('#run').click());
    await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 1000");

    await page.evaluate("var old5 = document.body.$('#main-element').$$('tr')[5]");

    await page.evaluate(() => document.body.$('#main-element').$$('tr')[0].$('td .remove').click());
    await page.waitForFunction(
      "document.body.$('#main-element').$$('tr')[0].$('td').textContent === '2'"
    );

    const same5 = await page.evaluate("old5 === document.body.$('#main-element').$$('tr')[4]");

    assert(same5);
  });

  it('can replace and add rows', async () => {
    await page.evaluate(() => document.body.$('#main-element').$('#run').click());
    await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 1000");

    await page.evaluate(() => document.body.$('#main-element').$('#runlots').click());
    await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 10000");
  });

  it('can replace and delete rows', async () => {
    await page.evaluate(() => document.body.$('#main-element').$('#runlots').click());
    await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 10000");

    await page.evaluate(() => document.body.$('#main-element').$('#run').click());
    await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 1000");
  });

  const arrangements = require('./speedtest.arrangements'),
    l = arrangements.length;
  for (let i = 0; i < l; i++) {
    it(`has same arrangement as non keyed version for ${arrangements[i].name}`, async () => {
      await page.goto(`${PATH}/speedtest.html?useKey`);
      await page.evaluate(() => document.body.$('#main-element').$('#run').click());
      await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 1000");
      const arrangedKeyed = await page.evaluate(arrangements[i]);
      const arrangementKeyed = await page.evaluate(getIds);

      await page.goto(`${PATH}/speedtest.html`);
      await page.evaluate(() => document.body.$('#main-element').$('#run').click());
      await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 1000");
      const arrangedNonKeyed = await page.evaluate(arrangements[i]);
      const arrangementNonKeyed = await page.evaluate(getIds);

      await page.goto(`${PATH}/speedtest.html?useAsync`);
      await page.evaluate(() => document.body.$('#main-element').$('#run').click());
      await page.waitForFunction("document.body.$('#main-element').$$('tr').length === 1000");
      const arrangedAsync = await page.evaluate(arrangements[i]);
      const arrangementAsync = await page.evaluate(getIds);

      const arrangementData = await page.evaluate(getDataIds);

      expect(arrangementNonKeyed).to.deep.equal(arrangementData);
      expect(arrangementKeyed).to.deep.equal(arrangementData);
      expect(arrangementAsync).to.deep.equal(arrangementData);
      assert.equal(arrangedKeyed, true);
      assert.equal(arrangedNonKeyed, true);
      assert.equal(arrangedAsync, true);
    });
  }
});
