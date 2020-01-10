async function getValues(name) {
  return (
    await page.evaluate(() => ({
      memo0: document.querySelector('#memo0').textContent,
      memo1: document.querySelector('#memo1').textContent,
      memoobj: document.querySelector('#memoobj').textContent,
      memomulti: document.querySelector('#memomulti').textContent
    }))
  )[name];
}

function setProps(props) {
  return page.evaluate(ps => window.setProps(ps), props);
}

describe('memo', () => {
  beforeEach(async () => {
    await page.goto(`${PATH}/memo.html`);
  });

  it('works with 0 deps', async () => {
    const valuesStart = await getValues('memo0');
    await setProps({ text: 'a', text1: 'b' });
    await setProps({ object: {} });
    assert.equal(valuesStart, await getValues('memo0'));
  });

  it('works with 1 deps', async () => {
    await setProps({ text: 'sfsdf' });
    assert.equal(1, await getValues('memo1'));
    await setProps({ object: {} });
    assert.equal(1, await getValues('memo1'));
    await setProps({ text: 'sfsdf' });
    assert.equal(1, await getValues('memo1'));
    await setProps({ text1: 'b' });
    assert.equal(1, await getValues('memo1'));
    await setProps({ text: 'sgkll' });
    assert.equal(2, await getValues('memo1'));
  });

  it('works with 1 object deps', async () => {
    assert.equal(0, await getValues('memoobj'));
    await setProps({ object: {} });
    assert.equal(1, await getValues('memoobj'));
    await setProps({ text: 'sfsdf' });
    assert.equal(1, await getValues('memoobj'));
    await setProps({ text1: 'b' });
    assert.equal(1, await getValues('memoobj'));
    await setProps({ object: {} });
    assert.equal(2, await getValues('memoobj'));
  });

  it('works with 2 text deps', async () => {
    assert.equal(0, await getValues('memomulti'));
    await setProps({ object: {} });
    assert.equal(0, await getValues('memomulti'));
    await setProps({ text: 'sfsdf' });
    assert.equal(1, await getValues('memomulti'));
    await setProps({ text1: 'bghhhg' });
    assert.equal(2, await getValues('memomulti'));
    await setProps({ object: {} });
    assert.equal(2, await getValues('memomulti'));
    await setProps({ text1: 'dsgdfh;', text: 'sdghh' });
    assert.equal(3, await getValues('memomulti'));
  });
});
