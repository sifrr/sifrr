module.exports = (fxns, proto, delTo) => {
  fxns.forEach(fxn => {
    proto[fxn] = function () {
      this[delTo][fxn](...arguments);
      return this;
    };
  });
};
