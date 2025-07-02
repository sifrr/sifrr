import runClickBenchmark from './runclickbenchmark';

class BenchmarkRunner {
  constructor(benchmarks = [], { port = 1111, runs = 5, url, warmups = runs, page } = {}) {
    this.benchmarks = benchmarks;
    this.port = port;
    this.runs = runs;
    this.url = url;
    this.warmups = warmups;
    this.speedMetrics = {};
    this.page = page;
  }

  async run() {
    const client = await this.page.context().newCDPSession(this.page);

    await client.send('Performance.enable');

    const l = this.benchmarks.length;
    for (let i = 0; i < l; i++) {
      const b = this.benchmarks[i];
      this.speedMetrics[b] = await runClickBenchmark(
        b,
        this.port,
        this.runs,
        this.url,
        this.warmups,
        undefined,
        this.page
      );
    }

    return this.speedMetrics;
  }
}

export default BenchmarkRunner;
