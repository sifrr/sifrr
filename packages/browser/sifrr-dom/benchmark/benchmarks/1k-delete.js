const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  static beforeAll() {
    return this.prototype.mainClick('#run');
  }

  static beforeAllWait() {
    return `${this.prototype.main} && ${this.prototype.main}.$$('tr').length === 1000`;
  }

  run() {
    return page.evaluate(`${this.main}.$$('tr .remove')[5].click()`);
  }

  runWait() {
    return `${this.main}.$$('tr .id')[5].textContent == ${this.i + 7}`;
  }
}

module.exports = OnekRun;
