const Benchmark = require('./benchmark');

class OnekReplace extends Benchmark {
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
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${this.constructor.start + 1000 * (this.i + 1) + 1}'`;
  }
}

module.exports = OnekReplace;
