const Benchmark = require('./benchmark');

class OnekRun extends Benchmark {
  before() {
    return this.mainClick('#runlots');
  }

  beforeWait() {
    return `${this.main}.$$('tr').length === 10000`;
  }

  run() {
    return this.mainClick('#add');
  }

  runWait() {
    return `${this.main}.$$('tr').length === 11000`;
  }
}

module.exports = OnekRun;
