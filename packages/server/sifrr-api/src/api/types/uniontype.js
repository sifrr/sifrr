const BaseType = require('./basetype');
const ObjectType = require('./objects/objecttype');

class UnionType extends BaseType {
  constructor(name, { objects = [] } = {}) {
    super(name);
    this.objects = new Set([...objects].filter(o => o instanceof ObjectType));
  }

  getSchema() {
    return `union ${this.name} = ${[...this.objects].join(' | ')}`;
  }
}

module.exports = UnionType;
