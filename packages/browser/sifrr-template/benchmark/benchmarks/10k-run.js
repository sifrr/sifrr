const Benchmark = require('./benchmark');

class TenkRun extends Benchmark {
  before() {
    return this.mainClick('#clear');
  }

  beforeWait() {
    return `${this.main}.$$('tr').length === 0`;
  }

  run() {
    return this.mainClick('#runlots');
  }

  runWait() {
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${this.constructor
      .start +
      10000 * this.i +
      1}'`;
  }
}

module.exports = TenkRun;
