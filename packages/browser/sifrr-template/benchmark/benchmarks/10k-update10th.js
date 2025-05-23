import Benchmark from './benchmark';

class TenkUpdate10th extends Benchmark {
  beforeAll() {
    return this.mainClick('#runlots');
  }

  beforeAllWait() {
    return `${this.main} && ${this.main}.$$('tr').length === 10000`;
  }

  run() {
    return this.mainClick('#update');
  }

  runWait() {
    return `${this.main}.$('tr td a') && ${
      this.main
    }.$('tr td a').textContent.indexOf('${' !!!'.repeat(this.i + 1)}') > 0`;
  }
}

export default TenkUpdate10th;
