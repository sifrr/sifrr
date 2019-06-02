module.exports = (a, b) => {
  if (typeof a !== 'object') return a !== b;
  for(const key in b) {
    if(!(key in a) || a[key] !== b[key]) return true;
  }
  return false;
};
