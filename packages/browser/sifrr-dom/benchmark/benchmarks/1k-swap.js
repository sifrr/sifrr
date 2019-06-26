const Benchmark = require('./benchmark');

class OnekSwap extends Benchmark {
  static beforeAll() {
    return this.prototype.mainClick('#run');
  }

  static beforeAllWait() {
    return `${this.prototype.main} && ${this.prototype.main}.$$('tr').length === 1000`;
  }

  before() {
    return this.mainClick('#swaprows');
  }

  beforeWait() {
    return `${this.main}.$$('tr')[1] && ${
      this.main
    }.$$('tr')[1].querySelector('td').textContent === '${this.constructor.start + 999}'`;
  }

  run() {
    return this.mainClick('#swaprows');
  }

  runWait() {
    return `${this.main}.$$('tr')[1] && ${
      this.main
    }.$$('tr')[1].querySelector('td').textContent === '${this.constructor.start + 2}'`;
  }
}

module.exports = OnekSwap;
