const Benchmark = require('./benchmark');

class OnekDelete extends Benchmark {
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
    return `${this.main}.$$('tr td:first-child')[5].textContent == ${this.constructor.start +
      this.i +
      7}`;
  }
}

module.exports = OnekDelete;
