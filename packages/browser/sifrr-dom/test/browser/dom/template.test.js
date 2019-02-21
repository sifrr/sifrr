async function testTemplate(fxn) {
  expect(await getValue(fxn)).to.deep.equal({
    name: 'TEMPLATE',
    content: 'ok'
  });
}

async function getValue(fxn) {
  return await page.evaluate((fxx) => {
    const node = new Function(`return (${fxx}).call()`)();
    return {
      name: node.nodeName,
      content: node.content.childNodes[0].textContent
    };
  }, fxn.toString());
}

describe('Sifrr.Dom.template', () => {
  before(async () => {
    await page.goto(`${PATH}/setup.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('always returns a template', async () => {
    await testTemplate(() => Sifrr.Dom.template('ok'));
    await testTemplate(() => {
      const ok = 'k';
      return Sifrr.Dom.template`o${ok}`;
    });
    await testTemplate(() => Sifrr.Dom.template([document.createTextNode('ok')]));
    await testTemplate(() => Sifrr.Dom.template(document.createTextNode('ok')));
    await testTemplate(() => {
      const temp = document.createElement('template');
      temp.innerHTML = 'ok';
      return Sifrr.Dom.template(temp);
    });
  });

  it('works with bindings', async () => {
    expect((await getValue(() => Sifrr.Dom.template('abcd${ok}mnop'))).content).to.eq('abcd${ok}mnop');
    expect((await getValue(() => Sifrr.Dom.template`abcd\${ok}mnop`)).content).to.eq('abcd${ok}mnop');
    expect((await getValue(() => Sifrr.Dom.template`abcd\$\{ok}mnop`)).content).to.eq('abcd${ok}mnop');
    expect((await getValue(() => Sifrr.Dom.template`abcd$\{ok}mnop`)).content).to.eq('abcd${ok}mnop');
  });
});
