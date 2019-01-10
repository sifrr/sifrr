const puppeteer = require('puppeteer');

const URL = 'http://localhost:1111/test.html';

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);
  await page.goto(URL);
  const renderedContent = await page.evaluate(() => new XMLSerializer().serializeToString(document));
  console.log(renderedContent);
}

main();
