const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  static beforeAll() {
    return this.prototype.mainClick('#runlots');
  }

  static beforeAllWait() {
    return `${this.prototype.main}.$$('tr').length === 10000`;
  }

  run() {
    return this.mainClick('#runlots');
  }

  runWait() {
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${10000 * (this.i + 1) + 1}'`;
  }
}

module.exports = OnekRun;
