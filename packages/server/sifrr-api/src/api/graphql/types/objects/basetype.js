class BaseType {
  constructor(name) {
    if (BaseType.get(name)) return BaseType.get(name);
    if (!name) throw Error('Type must have a name');
    this.name = name;
    BaseType.add(this);
  }

  clone(name) {
    return new this.constructor(name, { ...this });
  }

  getSchema() {
    throw Error('Each type should implement a getSchema method');
  }

  static from() {
    throw Error('Each Type must implement a static from method');
  }

  static add(obj) {
    this.all[obj.name] = obj;
  }

  static get(name) {
    return this.all[name];
  }
}
BaseType.all = {};

module.exports = BaseType;
