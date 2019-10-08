const all = new Map();

const clear = () => {
  all.forEach((v, n) => {
    if (['Id', 'Int', 'Float', 'String', 'Boolean'].indexOf(n) < 0) all.delete(n);
  });
};

clear();

module.exports = {
  all,
  add: obj => all.set(obj.name, obj),
  clear
};
