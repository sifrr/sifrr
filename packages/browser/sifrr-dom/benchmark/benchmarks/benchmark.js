class Benchmark {
  constructor(i) {
    this.i = i;
  }

  static async setup() {
    await page.evaluate(async () => await Sifrr.Dom.loading());
    this.start = await page.evaluate(`window.from - 1`);
  }

  static beforeAll() { return Promise.resolve(true); }

  before() { return Promise.resolve(true); }
  run() { return Promise.resolve(true); }

  static beforeAllWait() { return '1 === 1'; }

  beforeWait() { return '1 === 1'; }
  runWait() { return '1 === 1'; }

  get main() {
    return "document.querySelector('#main')";
  }

  mainClick(selector) {
    return page.$eval('#main', (el, selector) => el.$(selector).click(), selector);
  }

  static async metrics() {
    const ret = {};
    const ms = (await page._client.send('Performance.getMetrics')).metrics;
    ms.forEach(m => {
      if (m.name.indexOf('Duration') > 0) {
        ret[m.name] = m.value * 1000;
      } else ret[m.name] = m.value;
    });
    return ret;
  }

  static metricsDiff(oldM, newM) {
    const diff = {};
    for (let m in oldM) {
      diff[m] = Math.round((newM[m] - oldM[m]) * 100) / 100;
    }
    return diff;
  }
}

module.exports = Benchmark;
