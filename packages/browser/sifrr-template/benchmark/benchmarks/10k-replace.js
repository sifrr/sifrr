import Benchmark from './benchmark';

class TenkReplace extends Benchmark {
  beforeAll() {
    return this.mainClick('#runlots');
  }

  beforeAllWait() {
    return `${this.main}.$$('tr').length === 10000`;
  }

  run() {
    return this.mainClick('#runlots');
  }

  runWait() {
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${
      10000 * (this.i + 1) + 1
    }'`;
  }
}

export default TenkReplace;
