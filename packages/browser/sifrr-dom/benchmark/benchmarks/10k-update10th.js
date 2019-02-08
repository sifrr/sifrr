const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  static beforeAll() {
    return this.prototype.mainClick('#runlots');
  }

  static beforeAllWait() {
    return `${this.prototype.main} && ${this.prototype.main}.$$('tr').length === 10000`;
  }

  run() {
    return this.mainClick('#update');
  }

  runWait() {
    return `${this.main}.$('tr td a') && ${this.main}.$('tr td a').textContent.indexOf('${(' !!!').repeat(this.i + 1)}') > 0`;
  }
}

module.exports = OnekRun;
