const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  before() {
    return this.mainClick('#runlots');
  }

  beforeWait() {
    return `${this.main}.$$('tr').length === 10000`;
  }

  run() {
    return this.mainClick('#clear');
  }

  runWait() {
    return `${this.main}.$$('tr').length === 0`;
  }
}

module.exports = OnekRun;
