function rearrange() {
  function moveEl(arr, oldPosition, newPosition) {
    return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
  }
  const data = document.body.$('main-element').state.data;
  moveEl(data, 23, 879);
  moveEl(data, 1, 7);
  moveEl(data, 12, 4);
  moveEl(data, 13, 8);
  data.map(d => d.id);
  document.body.$('main-element').update();
}

describe('Sifrr.Dom.keyed', () => {
  beforeEach(async () => {
    await page.goto(`${PATH}/speedtest.html?useKey`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('rearranges swaps rows and not update them', async () => {
    await page.evaluate(() => document.body.$('main-element').$('#run').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 1000");

    await page.evaluate(() => window.old2 = document.body.$('main-element').$$('tr')[1]);
    await page.evaluate(() => window.old998 = document.body.$('main-element').$$('tr')[998]);

    await page.evaluate(() => document.body.$('main-element').$('#swaprows').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr')[1].$('td').textContent === '999'");

    const same2 = await page.evaluate(() => window.old2 === document.body.$('main-element').$$('tr')[998]);
    const same998 = await page.evaluate(() => window.old998 === document.body.$('main-element').$$('tr')[1]);

    assert(same2);
    assert(same998);
  });

  it('deletes row and not update them and remove last one', async () => {
    await page.evaluate(() => document.body.$('main-element').$('#run').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 1000");

    await page.evaluate(() => window.old5 = document.body.$('main-element').$$('tr')[5]);

    await page.evaluate(() => document.body.$('main-element').$$('tr')[0].$('td .remove').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr')[0].$('td').textContent === '2'");

    const same5 = await page.evaluate(() => window.old5 === document.body.$('main-element').$$('tr')[4]);

    assert(same5);
  });

  it('can replace and add rows', async () => {
    await page.evaluate(() => document.body.$('main-element').$('#run').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 1000");

    await page.evaluate(() => document.body.$('main-element').$('#runlots').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 10000");
  });

  it('can replace and delete rows', async () => {
    await page.evaluate(() => document.body.$('main-element').$('#runlots').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 10000");

    await page.evaluate(() => document.body.$('main-element').$('#run').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 1000");
  });

  it('has same arrangement as non keyed version', async () => {
    await page.evaluate(() => document.body.$('main-element').$('#run').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 1000");
    await page.evaluate(rearrange);
    const arrangementKeyed = await page.evaluate(() => document.body.$('main-element').state.data.map(d => d.id));

    await page.goto(`${PATH}/speedtest.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });

    await page.evaluate(() => document.body.$('main-element').$('#run').click());
    await page.waitForFunction("document.body.$('main-element').$$('tr').length === 1000");
    await page.evaluate(rearrange);
    const arrangementNonKeyed = await page.evaluate(() => document.body.$('main-element').state.data.map(d => d.id));

    expect(arrangementKeyed[4]).to.equal(13);
    expect(arrangementKeyed).to.deep.equal(arrangementNonKeyed);
  });
});