const EPORT = 7777;
const SPORT = 7776;
const EPATH = `http://localhost:${EPORT}`;
const loadtest = require('util').promisify(require('loadtest').loadTest);

function clean(results) {
  const ans = {};
  ['rps', 'meanLatencyMs', 'totalRequests', 'totalErrors', 'totalTimeSeconds'].forEach(i => ans[i] = results[i]);
  return ans;
}

module.exports = {
  loadTest: async function(url) {
    const expressResults = await loadtest({
      url: url(EPATH),
      concurrency: 8,
      maxSeconds: 1,
      maxRequests: 500,
      headers: {
        'accept-encoding': 'gzip'
      }
    });
    const sifrrResults = await loadtest({
      url: url(PATH),
      concurrency: 8,
      maxSeconds: 1,
      maxRequests: 500,
      headers: {
        'accept-encoding': 'gzip'
      }
    });
    global.console.table({ sifrr: clean(sifrrResults), express: clean(expressResults) });
    assert(sifrrResults.rps > expressResults.rps);
    assert(sifrrResults.meanLatencyMs < expressResults.meanLatencyMs);
  },
  EPORT,
  SPORT,
  EPATH,
  okTest: async function(url) {
    return page.goto(url).then(() => true).catch(() => false);
  }
};
