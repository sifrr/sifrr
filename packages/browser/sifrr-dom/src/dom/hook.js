const shouldMerge = require('../utils/shouldmerge');

class Hook {
  constructor(initial) {
    this.value = initial;
  }

  set(newValue) {
    if (shouldMerge(this.value, newValue)) Object.assign(this.value, newValue);
  }
}

module.exports = Hook;