const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  before() {
    return this.mainClick('#clear');
  }

  beforeWait() {
    return `${this.main}.$$('tr').length === 0`;
  }

  run() {
    return this.mainClick('#run');
  }

  runWait() {
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${this.constructor
      .start +
      1000 * this.i +
      1}'`;
  }
}

module.exports = OnekRun;
