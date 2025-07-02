import Benchmark from './benchmark';

class OnekSelect extends Benchmark {
  beforeAll() {
    return this.mainClick('#run');
  }

  beforeAllWait() {
    return `${this.main} && ${this.main}.$$('tr').length === 1000`;
  }

  run() {
    return this.page.evaluate(`${this.main}.$$('tr td:nth-child(2) a')[${this.i + 5}].click()`);
  }

  runWait() {
    return `${this.main}.$$('tr')[${this.i + 5}].classList.contains('danger')`;
  }
}

export default OnekSelect;
