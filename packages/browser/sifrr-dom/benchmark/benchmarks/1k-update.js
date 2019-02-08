const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  static beforeAll() {
    return this.prototype.mainClick('#run');
  }

  static beforeAllWait() {
    return `${this.prototype.main}.$$('tr').length === 1000`;
  }

  run() {
    return this.mainClick('#run');
  }

  runWait() {
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${1000 * (this.i + 1) + 1}'`;
  }
}

module.exports = OnekRun;
