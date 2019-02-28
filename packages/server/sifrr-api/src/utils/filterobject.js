module.exports = function(json, fxn) {
  const res = {};
  for (let k in json) {
    if (fxn(k)) res[k] = json[k];
  }
  return res;
};
