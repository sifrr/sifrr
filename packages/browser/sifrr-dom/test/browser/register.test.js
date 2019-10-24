describe('Sifrr.Dom.register', () => {
  before(async () => {
    await page.goto(`${PATH}/setup.html`);
    await page.evaluate(async () => {
      await Sifrr.Dom.loading();
    });
  });

  it('registers a custom element with given elementName and adds to Dom.elements', async () => {
    const el = await page.evaluate(async () => {
      await Sifrr.Dom.register(
        class RandomElement extends HTMLElement {
          static get elementName() {
            return 'random-el';
          }
        }
      );
      return {
        windowElement: !!window.customElements.get('random-el'),
        sifrrElement: !!Sifrr.Dom.elements['random-el']
      };
    });

    expect(el.windowElement).to.eq(true);
    expect(el.sifrrElement).to.eq(true);
  });

  it('throws error if elementName is not defined', async () => {
    const error = await page.evaluate(() => Sifrr.Dom.register({}).catch(e => e.message));

    expect(error).to.eq('Error creating Custom Element: No name given.');
  });

  it('throws error if elementName has no dash', async () => {
    const error = await page.evaluate(() =>
      Sifrr.Dom.register({ elementName: 'nodash' }).catch(e => e.message)
    );

    expect(error).to.eq(
      "Error creating Element: nodash - Custom Element name must have one dash '-'"
    );
  });

  it('warns if element-name already taken', async () => {
    const error = await page.evaluate(() => {
      let msg;
      window.console.warn = m => (msg = m);
      window.customElements.define('random-name', class extends HTMLElement {});
      Sifrr.Dom.register({ elementName: 'random-name' });
      return msg;
    });

    expect(error).to.eq(
      'Error creating Element: random-name - Custom Element with this name is already defined.'
    );
  });

  it('consoles error if customElements define throws error', async () => {
    const error = await page.evaluate(async () => {
      let msg;
      window.customElements.define = () => {
        throw Error('error on define');
      };
      await Sifrr.Dom.register({ elementName: 'some-custom' }).catch(e => {
        msg = e.message;
      });
      return msg;
    });

    expect(error).to.eq('Error creating Custom Element: some-custom - error on define');
  });
});
