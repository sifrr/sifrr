const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  static beforeAll() {
    return this.prototype.mainClick('#run');
  }

  static beforeAllWait() {
    return `${this.prototype.main} && ${this.prototype.main}.$$('tr').length === 1000`;
  }

  run() {
    return page.evaluate(`${this.main}.$$('tr td:nth-child(3) a')[5].click()`);
  }

  runWait() {
    return `${this.main}.$$('tr td:first-child')[5].textContent == ${this.i + 7}`;
  }
}

module.exports = OnekRun;
