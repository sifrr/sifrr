const ObjectType = require('./objecttype');

class QueryType extends ObjectType {
  constructor(name, options) {
    if (!options) name = options;

    super('Query', options);
  }
}

module.exports = QueryType;
