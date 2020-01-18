describe('Controlled inputs', () => {
  before(async () => {
    await page.goto(`${PATH}/controlled.html`);
  });

  it('controls input and textarea', async () => {
    assert(
      await page.evaluate(() => {
        window.value = 'abcd';
        window.updater.update();
        return document.querySelector('input').value === 'abcd';
      })
    );

    const input = await page.evaluateHandle(`document.querySelector('input')`);
    await input.type('some');

    const value = await page.evaluate(() => {
      return document.querySelector('input').value;
    });
    assert.equal(value, 'abcdsome');

    const ta = await page.evaluateHandle(`document.querySelector('textarea')`);
    await ta.type('xxx');

    const tvalue = await page.evaluate(() => {
      return document.querySelector('textarea').value;
    });
    assert.equal(
      tvalue,
      'abcdsome',
      `doesn't update value because it is controlled by input value`
    );
  });
});
