const path =require('path');
const server = require('../../../../scripts/test/server');
const runClickBenchmark = require('./runclickbenchmark');

class BenchmarkRunner {
  constructor(benchmarks = [], { port = 1111, runs = 5, url, warmups = runs } = {}) {
    this.benchmarks = benchmarks;
    this.port = port;
    this.runs = runs;
    this.url = url;
    this.warmups = warmups;
    this.speedMetrics = {};
  }

  startServer() {
    this.server = server(this.port, path.join(__dirname, '../test/public'));
  }

  closeServer() {
    if (this.server) this.server.close();
  }

  async run() {
    if (!this.url) this.startServer();

    await page._client.send('Performance.enable');

    const l = this.benchmarks.length;
    for (let i = 0; i < l; i++) {
      const b = this.benchmarks[i];
      this.speedMetrics[b] = await runClickBenchmark(b, this.port, this.runs, this.url, this.warmups);
    }

    this.closeServer();
    return this.speedMetrics;
  }
}

module.exports = BenchmarkRunner;
