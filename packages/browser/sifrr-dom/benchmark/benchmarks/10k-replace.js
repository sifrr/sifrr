const Benchmark = require('./benchmark');

class TenkReplace extends Benchmark {
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
    return `${this.main}.$('tr td') && ${this.main}.$('tr td').textContent === '${this.constructor.start + 10000 * (this.i + 1) + 1}'`;
  }
}

module.exports = TenkReplace;
