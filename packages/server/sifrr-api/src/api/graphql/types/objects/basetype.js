class BaseType {
  constructor(name) {
    if (!name) throw Error('Type must have a name: ' + JSON.stringify(this));
    if (this.constructor.all.get(name)) return this.constructor.all.get(name);

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
    this.all.set(obj.name, obj);
  }
}
BaseType.all = new Map();

// scalar types
new BaseType('Id');
new BaseType('Int');
new BaseType('Float');
new BaseType('String');
new BaseType('Boolean');

module.exports = BaseType;
