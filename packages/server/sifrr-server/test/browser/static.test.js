const fs = require('fs');

const { okTest } = require('./utils');

describe('static test', function() {
  before(async () => {
    await page.goto(`${PATH}/static.html`);
  });

  it('serves base folder', async () => {
    assert.equal(await okTest(`${PATH}/example.json`), true);
  });

  it('serves all subfolder folders recursively', async () => {
    assert.equal(await okTest(`${PATH}/compress/compressed.html`), true);
  });

  it("doesn't serve non-existent files", async () => {
    assert.equal(await okTest(`${PATH}/skjshfdk.html`), false);
    await page.waitForNavigation();
  });

  it('serves with prefix', async () => {
    assert.equal(await okTest(`${PATH}/p/example.json`), true);
  });

  it('serves files with pattern', async () => {
    assert.equal(await okTest(`${PATH}/random/asdasd`), true);
  });

  it('serves newly created files and 404 for deleted files', async () => {
    const filePath = path.join(__dirname, '../public/abcd');

    fs.writeFileSync(filePath, '');
    await timeout(200);
    const resp = await page.goto(`${PATH}/abcd`);
    expect(resp.status()).to.equal(200);

    fs.unlinkSync(filePath);
    await timeout(200);
    const resp2 = await page.goto(`${PATH}/abcd`);
    expect(resp2.status()).to.equal(404);
  });

  // keep in last because different urls
  it('responds with 304 when not modified and 200 when modified', async () => {
    const filePath = path.join(__dirname, '../public/304.json');

    fs.writeFileSync(filePath, JSON.stringify({ ok: 'no' }));
    await page.goto(`${PATH}/304.json`);

    expect((await page.reload()).status()).to.equal(304);

    await timeout(1000);
    fs.writeFileSync(filePath, JSON.stringify({ ok: 'yes' }));

    expect((await page.reload()).status()).to.equal(200);
  });

  it("doesn't respond with 304 when not modified and 200 when modified", async () => {
    await page.goto(`${PATH}/p/example.json`);
    expect((await page.reload()).status()).to.equal(200);
  });
});

function timeout(ms) {
  return new Promise(res => setTimeout(res, ms));
}
