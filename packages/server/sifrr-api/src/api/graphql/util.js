const BaseType = require('./types/basetype');

module.exports = {
  getType: type => {
    if (type instanceof BaseType) {
      return type.name;
    }
    return type;
  }
};
