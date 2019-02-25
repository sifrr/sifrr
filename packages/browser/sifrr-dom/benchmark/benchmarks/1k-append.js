const Benchmark = require('./benchmark');

class OnekAppend extends Benchmark {
  before() {
    return this.mainClick('#clear').then(() => this.mainClick('#run'));
  }

  beforeWait() {
    return `${this.main}.$$('tr').length === 1000`;
  }

  run() {
    return this.mainClick('#add');
  }

  runWait() {
    return `${this.main}.$$('tr').length === 2000`;
  }
}

module.exports = OnekAppend;
