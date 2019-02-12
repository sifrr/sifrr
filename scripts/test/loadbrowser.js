global.puppeteer = require('puppeteer');

module.exports = async function(slowMo) {
  if (global.browser && global.browser.current) await global.browser.close();
  // set browser and page global variables
  let pBrowser = await puppeteer.launch({
    // to make it work in circleci
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    headless: process.env.HEADLESS !== 'false',
    devtools: false,
    slowMo
  });
  let page = await pBrowser.newPage();
  await page.setViewport( { width: 1280, height: 800} );
  global.browser = pBrowser;
  global.page = page;

  return true;
};