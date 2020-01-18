describe('.onPropChange and .update', () => {
  before(async () => {
    await page.goto(`${PATH}/async.html`);
  });

  it('calls onPropChange on every prop and update once', async () => {
    assert.deepEqual(
      await page.evaluate(async () => {
        let i = 0;
        let b = 0;
        const a = [];
        const Temp = Sifrr.Template.html`<div :prop1=${() => i++} :prop2=${() =>
          i++} ::on-prop-change=${(name, oldValue, newValue) =>
          a.push({ name, oldValue, newValue })} ::update=${() => b++}></div>`;
        Temp({}, Temp({}));
        await new Promise(res => setTimeout(res, 1));
        return [a, b];
      }),
      [
        [
          {
            name: 'prop2',
            oldValue: 0,
            newValue: 2
          },
          {
            name: 'prop1',
            oldValue: 1,
            newValue: 3
          }
        ],
        1
      ]
    );
  });

  it("doesn't call if onPropChange is not a function", async () => {
    assert.deepEqual(
      await page.evaluate(() => {
        let i = 0;
        const a = {};
        const Temp = Sifrr.Template.html`<div :prop1=${() => i++} ::on-prop-change=${{}}></div>`;
        Temp({}, Temp({}));
        return a;
      }),
      {}
    );
  });
});
