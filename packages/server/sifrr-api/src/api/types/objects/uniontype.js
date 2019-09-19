const ObjectType = require('./objecttype');

class UnionType extends ObjectType {
  constructor(name, { types = [], resolveType, ...superOptions } = {}) {
    super(name, superOptions);
    this.types = new Set([...types].filter(o => o instanceof ObjectType));
    this.resolveType = resolveType;
  }

  getSchema() {
    return `union ${this.name} = ${[...this.types].map(o => o.name).join(' | ')}`;
  }
}

module.exports = UnionType;
