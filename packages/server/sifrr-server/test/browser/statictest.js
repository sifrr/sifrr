const EPORT = 4444, SPORT = 4445;

module.exports = {
  loadTest: async function(url, num, option) {
    const expressResults = await page.evaluate(async (u, n, o) => {
      return await testFetch(u, n, o);
    }, url(EPORT), num, option);
    const sifrrResults = await page.evaluate(async (u, n, o) => {
      return await testFetch(u, n, o);
    }, url(SPORT), num, option);
    global.console.table({ sifrr: sifrrResults, express: expressResults });
    assert(sifrrResults.rps > expressResults.rps);
    assert(sifrrResults.size === expressResults.size);
  },
  EPORT,
  SPORT,
  okTest: async function(url) {
    return await page.evaluate(async (u) => {
      return await Sifrr.Fetch.get(u).then(() => true).catch(() => false);
    }, url);
  }
};
