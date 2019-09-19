class BaseType {
  constructor(name) {
    this.name = name;
  }

  getSchema() {
    throw Error('Each type should implement a getSchema method');
  }
}

module.exports = BaseType;
