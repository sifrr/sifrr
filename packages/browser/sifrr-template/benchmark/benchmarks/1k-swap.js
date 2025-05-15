const Benchmark = require('./benchmark');

class OnekSwap extends Benchmark {
  beforeAll() {
    return this.mainClick('#run');
  }

  beforeAllWait() {
    return `${this.main} && ${this.main}.$$('tr').length === 1000`;
  }

  before() {
    return this.mainClick('#swaprows');
  }

  beforeWait() {
    return `${this.main}.$$('tr')[1] && ${
      this.main
    }.$$('tr')[1].querySelector('td').textContent === '${999}'`;
  }

  run() {
    return this.mainClick('#swaprows');
  }

  runWait() {
    return `${this.main}.$$('tr')[1] && ${
      this.main
    }.$$('tr')[1].querySelector('td').textContent === '${2}'`;
  }
}

module.exports = OnekSwap;
