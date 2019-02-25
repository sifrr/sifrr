const Benchmark = require('./benchmark');

class OnekClear extends Benchmark {
  before() {
    return this.mainClick('#run');
  }

  beforeWait() {
    return `${this.main}.$$('tr').length === 1000`;
  }

  run() {
    return this.mainClick('#clear');
  }

  runWait() {
    return `${this.main}.$$('tr').length === 0`;
  }
}

module.exports = OnekClear;
