const shouldMerge = require('../utils/shouldmerge');

class Hook {
  constructor(initial) {
    this.value = initial;
    this.listeners = [];
  }

  set(newValue) {
    if (shouldMerge(this.value, newValue)) Object.assign(this.value, newValue);
    this.listeners.forEach(l => l());
  }

  addListener(listener) {
    this.listeners.push(listener);
  }
}

module.exports = Hook;