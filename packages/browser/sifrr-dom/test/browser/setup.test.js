describe('Sifrr.Dom.setup', () => {
  before(async () => {
    await page.goto(`${PATH}/nosifrrsetup.html`);
  });

  it('sets up sifrr', async () => {
    const DOM = await page.evaluate(() => {
      Sifrr.Dom.setup({ useShadowRoot: false });
      return {
        config: Sifrr.Dom.config,
        events: Sifrr.Dom.Event.all
      };
    });

    expect(DOM).to.deep.equal({
      // Sets up config
      config: {
        useShadowRoot: false,
        url: null,
        urls: {},
        events: ['input', 'change', 'update']
      },
      // Adds event listeners
      events: {
        input: {},
        change: {},
        update: {}
      }
    });
  });
});
