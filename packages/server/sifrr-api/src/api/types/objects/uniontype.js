const ObjectType = require('./objecttype');

class UnionType extends ObjectType {
  constructor(name, { objects = [] } = {}) {
    super(name);
    this.objects = new Set([...objects].filter(o => o instanceof ObjectType));
  }

  getSchema() {
    return `union ${this.name} = ${[...this.objects].map(o => o.name).join(' | ')}`;
  }
}

module.exports = UnionType;
