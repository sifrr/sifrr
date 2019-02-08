class Benchmark {
  constructor(i) {
    this.i = i;
  }

  static beforeAll() { return Promise.resolve(true); }

  before() { return Promise.resolve(true); }
  run() { return Promise.resolve(true); }

  static beforeAllWait() { return '1 === 1'; }

  beforeWait() { return '1 === 1'; }
  runWait() { return '1 === 1'; }

  get main() {
    return "document.querySelector('main-element')";
  }

  mainClick(selector) {
    return page.$eval('main-element', (el, selector) => el.$(selector).click(), selector);
  }

  static async metrics() {
    const ret = {};
    const ms = (await page._client.send('Performance.getMetrics')).metrics;
    ms.forEach(m => ret[m.name] = m.value * 1000);
    return ret;
  }

  static metricsDiff(oldM, newM) {
    const diff = {};
    for (let m in oldM) {
      diff[m] = newM[m] - oldM[m];
    }
    return diff;
  }
}

module.exports = Benchmark;
