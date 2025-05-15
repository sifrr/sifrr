const Benchmark = require('./benchmark');

class OnekDelete extends Benchmark {
  beforeAll() {
    return this.mainClick('#run');
  }

  beforeAllWait() {
    return `${this.main} && ${this.main}.$$('tr').length === 1000`;
  }

  run() {
    return this.page.evaluate(`${this.main}.$$('tr td:nth-child(3) a')[5].click()`);
  }

  runWait() {
    return `${this.main}.$$('tr td:first-child')[5].textContent == ${this.i + 7}`;
  }
}

module.exports = OnekDelete;
