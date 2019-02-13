describe('shady polyfills', () => {
  before(async () => {
    await page.goto(`${PATH}/shady.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('works when polyfill is applied', async () => {
    await page.waitForSelector('shady-sr');
    const res = await page.evaluate(() => {
      return {
        SR: {
          isShady: !!document.querySelector('shady-sr').shadowRoot.__shady,
          pColor: getComputedStyle(document.querySelector('shady-sr').$('p')).color,
        },
        NOSR: {
          isShady: !!document.querySelector('shady-nosr').shadowRoot,
          pColor: getComputedStyle(document.querySelector('shady-nosr').$('p')).color,
        },
        P: {
          color: getComputedStyle(document.querySelector('body > p')).color
        }
      };
    });

    expect(res).to.deep.equal({
      SR: {
        isShady: true,
        pColor: 'rgb(0, 0, 255)'
      },
      NOSR: {
        isShady: false,
        pColor: 'rgb(255, 0, 0)'
      },
      P: {
        color: 'rgb(0, 0, 0)'
      }
    });
  });
});
