const Json = {
  shallowEqual: (a, b) => {
    for(const key in a) {
      if(!(key in b) || a[key] !== b[key]) {
        return false;
      }
    }
    for(const key in b) {
      if(!(key in a) || a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  }
};

module.exports = Json;
