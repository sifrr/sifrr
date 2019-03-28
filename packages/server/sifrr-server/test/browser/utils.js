const EPORT = 8889;
const EPATH = `http://localhost:${EPORT}`;

module.exports = {
  loadTest: async function(url, num, option) {
    const expressResults = await page.evaluate(async (u, n, o) => {
      return await testFetch(u, n, o).catch(e => e.message);
    }, url(EPATH), num, option);
    const sifrrResults = await page.evaluate(async (u, n, o) => {
      return await testFetch(u, n, o).catch(e => e.message);
    }, url(PATH), num, option);
    global.console.table({ sifrr: sifrrResults, express: expressResults });
    assert(sifrrResults.rps > expressResults.rps);
    assert(sifrrResults.size === expressResults.size);
  },
  EPORT,
  EPATH,
  okTest: async function(url) {
    return page.goto(url).then(() => true).catch(() => false);
  }
};
