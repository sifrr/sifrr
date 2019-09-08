describe('Sifrr.Dom.SimpleElement', () => {
  before(async () => {
    await page.goto(`${PATH}/simpleelement.html`);
  });

  it('is first element from string, also text nodes', async () => {
    const type = await page.evaluate('seBasic.nodeName');
    const type2 = await page.evaluate('seMultipleChild.nodeName');
    const type3 = await page.evaluate('seText.nodeName');

    expect(type).to.eq('DIV');
    expect(type2).to.eq('DIV');
    expect(type3).to.eq('#text');
  });

  it('renders default state', async () => {
    const inner = await page.evaluate('seState.innerHTML');
    const data = await page.evaluate('seTextState.data');

    expect(inner).to.eq('default');
    expect(data).to.eq('yay');
  });

  it('renders again when state is changed', async () => {
    await page.evaluate(() => {
      seState.setState({ p: 'new' });
      return seState.innerHTML;
    });
    // double render shouldn't change anything
    const inner = await page.evaluate(() => {
      seState.setState({ p: 'new' });
      return seState.innerHTML;
    });
    const data = await page.evaluate(() => {
      seTextState.setState({ text: 'newyay' });
      return seTextState.data;
    });
    const nulled = await page.evaluate(() => {
      seState.setState({ p: null });
      return seState.innerHTML;
    });

    expect(inner).to.eq('new');
    expect(data).to.eq('newyay');
    expect(nulled).to.eq('');
  });

  it('works with attributes', async () => {
    const state = await page.evaluate(() => {
      seAttr.setState({ attr: 'attrvalue', class: 'cls' });
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

  it('Negative state attributes are removed', async () => {
    const hasClass = await page.evaluate(() => {
      seAttr.setState({ class: null });
      return seAttr.querySelector('p').hasAttribute('class');
    });

    expect(hasClass).to.eq(false);
  });

  it('only updates binding when state is changed', async () => {
    const same = await page.evaluate(() => {
      const span1 = seExtra.querySelector('span');
      seExtra.setState({ p: 'new' });
      const span2 = seExtra.querySelector('span');
      return span1 === span2;
    });

    expect(same).to.eq(true);
  });

  it('only has required refs', async () => {
    expect(await page.evaluate('seComplex._refs.length')).to.eq(2);
  });

  it('works with dom elements', async () => {
    expect(await page.evaluate('seDom._refs.length')).to.eq(1);
  });

  it('works with comment nodes', async () => {
    expect(await page.evaluate('seComment._refs.length')).to.eq(2);
    expect(await page.evaluate('seComment.childNodes.length')).to.eq(3);
    expect(await page.evaluate('seComment.textContent')).to.eq('ba');
  });

  it('throws error if argument is not string', async () => {
    const error = await page.evaluate(() => {
      try {
        Sifrr.Dom.SimpleElement({});
        return true;
      } catch (e) {
        return e.message;
      }
    });

    expect(error).to.eq(
      'Argument must be of type string | template literal | Node | [Node] | NodeList'
    );
  });

  it("doesn't do anything with sifrr elements", async () => {
    const type1 = await page.evaluate(() => {
      const se = Sifrr.Dom.SimpleElement('<tr is="sifrr-row"></tr>');
      return typeof se.stateMap;
    });
    const type2 = await page.evaluate(() => {
      const se = Sifrr.Dom.SimpleElement('<sifrr-small></sifrr-small>');
      return typeof se.stateMap;
    });
    const type3 = await page.evaluate(() => {
      const se = Sifrr.Dom.SimpleElement(document.createElement('sifrr-small'));
      return typeof se.stateMap;
    });
    const type4 = await page.evaluate(async () => {
      const se = Sifrr.Dom.SimpleElement(document.createElement('tr', { is: 'sifrr-row' }));
      return typeof se.stateMap;
    });

    expect(type1).to.eq('undefined');
    expect(type2).to.eq('undefined');
    expect(type3).to.eq('undefined');
    expect(type4).to.eq('undefined');
  });

  describe('sifrrClone', () => {
    it('works', async () => {
      const type = await page.evaluate('seClone.nodeName');

      expect(type).to.eq('DIV');
    });

    it('is not same element', async () => {
      const eq = await page.evaluate('seClone === seComplex');

      expect(eq).to.eq(false);
    });

    it('has different refs', async () => {
      const eq = await page.evaluate('seClone._refs[0] === seComplex._refs[0]');

      expect(eq).to.eq(false);
    });

    it("doesn't update original when clone is updated", async () => {
      const same = await page.evaluate(() => {
        seClone.setState({ some: 'cloned' });

        return {
          stateEqual: seClone.state === seComplex.state,
          cloneText: seClone.childNodes[1].data,
          textEqual: seClone.childNodes[1].data === seComplex.childNodes[1].data
        };
      });

      expect(same).to.deep.equal({
        stateEqual: false,
        cloneText: 'cloned',
        textEqual: false
      });
    });

    it('clones state if given', async () => {
      const eq = await page.evaluate('seStateClone.state.p');

      expect(eq).to.eq('default');
    });
  });
});
