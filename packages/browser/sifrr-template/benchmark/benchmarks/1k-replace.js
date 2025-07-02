import Benchmark from './benchmark';

class OnekReplace extends Benchmark {
  beforeAll() {
    return this.mainClick('#run');
  }

  beforeAllWait() {
    return `${this.main}.$$('tr').length === 1000`;
  }

  run() {
    return this.mainClick('#run');
  }

  runWait() {
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${
      1000 * (this.i + 1) + 1
    }'`;
  }
}

export default OnekReplace;
