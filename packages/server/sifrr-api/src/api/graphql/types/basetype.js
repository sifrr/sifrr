class BaseType {
  constructor(name) {
    if (!name) throw Error('Type must have a name');
    this.name = name;
  }

  clone(name) {
    return new this.constructor(name || this.name, { ...this });
  }

  getSchema() {
    throw Error('Each type should implement a getSchema method');
  }

  static from() {
    throw Error('Each Type must implement a static from method');
  }
}

module.exports = BaseType;
