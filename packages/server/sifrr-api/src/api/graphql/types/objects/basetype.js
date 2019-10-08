const { all, add } = require('./alltypes');

class BaseType {
  constructor(name, schema = true) {
    if (!name) throw Error('Type must have a name: ' + JSON.stringify(this));
    if (all.get(name)) return all.get(name);

    this.name = name;
    this.schema = schema;
    add(this);
  }

  clone(name) {
    return new this.constructor(name, { ...this });
  }

  getSchema() {
    return this.schema ? `scalar ${this.name}` : '';
  }

  static from() {
    throw Error('Each Type must implement a static from method');
  }
}

// scalar types
new BaseType('Id', false);
new BaseType('Int', false);
new BaseType('Float', false);
new BaseType('String', false);
new BaseType('Boolean', false);

module.exports = BaseType;
