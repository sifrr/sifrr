const Benchmark = require('./benchmark');

class OnekSelect extends Benchmark {
  static beforeAll() {
    return this.prototype.mainClick('#run');
  }

  static beforeAllWait() {
    return `${this.prototype.main} && ${this.prototype.main}.$$('tr').length === 1000`;
  }

  run() {
    return page.evaluate(`${this.main}.$$('tr td:nth-child(2) a')[${this.i + 5}].click()`);
  }

  runWait() {
    return `${this.main}.$$('tr')[${this.i + 5}].classList.contains('danger')`;
  }
}

module.exports = OnekSelect;
