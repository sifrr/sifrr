const shouldMerge = require('../utils/shouldmerge');
const objCon = ({}).constructor;

class Hook {
  constructor(initial) {
    this.value = initial;
    this.listeners = [];
  }

  set(newValue) {
    if (shouldMerge(this.value, newValue)) {
      if (this.value.constructor === objCon) Object.assign(this.value, newValue);
      else this.value = newValue;
    }
    this.listeners.forEach(l => l());
  }

  addListener(listener) {
    this.listeners.push(listener);
  }
}

module.exports = Hook;