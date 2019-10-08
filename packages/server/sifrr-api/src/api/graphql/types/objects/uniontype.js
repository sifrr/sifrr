const ObjectType = require('./objecttype');
const { objectToMap } = require('../../util');
const { all } = require('./alltypes');

class UnionType extends ObjectType {
  constructor(name, { types = [], resolveType, ...superOptions } = {}) {
    if (all.get(name)) return all.get(name);

    super(name, superOptions);
    this.types = objectToMap(types, ObjectType);
    this.resolveType = resolveType;
  }

  getSchema() {
    return `union ${this.name} = ${[...this.types.values()].map(o => o.name).join(' | ')}`;
  }
}

UnionType.type = 'union';

module.exports = UnionType;
