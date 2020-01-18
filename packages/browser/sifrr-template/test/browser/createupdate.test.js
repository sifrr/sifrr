/* eslint-disable no-undef */
describe('Create/Update', () => {
  before(async () => {
    await page.goto(`${PATH}/createupdate.html`);
  });

  it('are elements from string, also text nodes', async () => {
    const type = await page.evaluate('seBasic.nodeName');
    const type2 = await page.evaluate('seMultipleChild[0].nodeName');
    const type3 = await page.evaluate('seMultipleChild[1].nodeName');
    const type4 = await page.evaluate('seText.nodeName');

    expect(type).to.eq('DIV');
    expect(type2).to.eq('DIV');
    expect(type3).to.eq('P');
    expect(type4).to.eq('#text');
  });

  it('renders fragment if outer binding', async () => {
    const name = await page.evaluate('seTextState.nodeName');

    expect(name).to.eq('SIFRR-FRAGMENT');
  });

  it('renders props given', async () => {
    const inner = await page.evaluate('seStateBase.outerHTML');
    const data = await page.evaluate('seTextState.innerHTML');

    expect(inner).to.eq('<p>default</p>');
    expect(data).to.eq('yay');
  });

  it('renders again when state is changed', async () => {
    await page.evaluate(() => {
      update(seState, { p: 'new' });
      return seState.innerHTML;
    });
    // double render shouldn't change anything
    const inner = await page.evaluate(() => {
      update(seState, { p: 'new' });
      return seState.innerHTML;
    });
    const data = await page.evaluate(() => {
      update(seState, { p: 'newyay' });
      return seState.innerHTML;
    });
    const nulled = await page.evaluate(() => {
      update(seState, { p: null });
      return seState.innerText;
    });

    expect(inner).to.eq('new');
    expect(data).to.eq('newyay');
    expect(nulled).to.eq('');
  });

  it('works with attributes', async () => {
    const state = await page.evaluate(() => {
      update(seAttr, { attr: 'attrvalue', className: 'cls' });
      return {
        attr: seAttr.querySelector('p').dataset.attr,
        class: seAttr.querySelector('p').className
      };
    });

    expect(state).to.deep.eq({
      attr: 'attrvalue',
      class: 'cls'
    });
  });

  it('nulled/undefined attributes are removed', async () => {
    const hasClass = await page.evaluate(() => {
      update(seAttr, { class: null });
      return (
        seAttr.querySelector('p').hasAttribute('class') ||
        seAttr.querySelector('p').hasAttribute('attrvalue')
      );
    });

    expect(hasClass).to.eq(false);
  });

  it('only updates binding when state is changed', async () => {
    const same = await page.evaluate(() => {
      const span1 = seExtra.querySelector('span');
      update(seExtra, { p: 'neefsdfdsfw' });
      const span2 = seExtra.querySelector('span');
      return span1 === span2;
    });

    expect(same).to.eq(true);
  });

  it('works with comment nodes', async () => {
    expect(await page.evaluate('seComment.childNodes.length')).to.eq(3);
    expect(await page.evaluate('seComment.textContent')).to.eq('abcommentcd');
  });
});
