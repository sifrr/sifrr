const ObjectType = require('./objecttype');

class QueryType extends ObjectType {
  constructor(name, options) {
    if (!options) options = name;

    super('Query', options);
  }
}

module.exports = QueryType;
