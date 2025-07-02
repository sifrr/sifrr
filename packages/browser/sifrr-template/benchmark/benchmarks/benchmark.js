class Benchmark {
  constructor(i, page) {
    this.i = i;
    this.page = page;
  }

  async setup() {
    this.start = (await this.page.evaluate(`window.from - 1`)) || 0;
  }

  beforeAll() {
    return Promise.resolve(true);
  }

  before() {
    return Promise.resolve(true);
  }

  run() {
    return Promise.resolve(true);
  }

  beforeAllWait() {
    return '1 === 1';
  }

  beforeWait() {
    return '1 === 1';
  }
  runWait() {
    return '1 === 1';
  }

  get main() {
    return "document.querySelector('#main')";
  }

  get cpuSlowdown() {
    return 1;
  }

  mainClick(selector) {
    return this.page.$eval('#main', (el, selector) => el.$(selector).click(), selector);
  }

  async metrics() {
    const ret = {};
    const client = await this.page.context().newCDPSession(this.page);
    const ms = (await client.send('Performance.getMetrics')).metrics;
    ms.forEach((m) => {
      if (m.name.indexOf('Duration') > 0) {
        ret[m.name] = m.value * 1000;
      } else ret[m.name] = m.value;
    });
    return ret;
  }

  metricsDiff(oldM, newM) {
    const diff = {};
    for (const m in oldM) {
      diff[m] = Math.round((newM[m] - oldM[m]) * 100) / 100;
    }
    return diff;
  }
}

export default Benchmark;
