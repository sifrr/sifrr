const Json = {
  shallowEqual: (a, b) => {
    for(let key in a) {
      if(!(key in b) || a[key] !== b[key]) {
        return false;
      }
    }
    for(let key in b) {
      if(!(key in a) || a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  }
};

module.exports = Json;
