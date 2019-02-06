describe('Sifrr.Dom.setup', () => {
  before(async () => {
    await page.goto(`${PATH}/nosifrrsetup.html`);
  });

  it('gives error if wrong config given', async () => {
    const error = await page.evaluate(() => {
      try {
        Sifrr.Dom.setup({ baseUrl: () => {} });
        return true;
      } catch(e) {
        return e.message;
      }
    });

    expect(error).to.eq('baseUrl should be a string');
  });

  it('sets up sifrr', async () => {
    const DOM = await page.evaluate(() => {
      Sifrr.Dom.setup({ baseUrl: '/', useShadowRoot: false });
      return {
        config: Sifrr.Dom.config,
        events: Sifrr.Dom.Event.all
      };
    });

    expect(DOM).to.deep.equal({
      // Sets up config
      config: {
        baseUrl: '/',
        useShadowRoot: false
      },
      // Adds event listeners
      events: {
        input: {
          document: [{}]
        },
        change: {
          document: [{}]
        }
      }
    });
  });
});
