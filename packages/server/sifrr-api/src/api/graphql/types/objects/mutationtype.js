const ObjectType = require('./objecttype');

class MutationType extends ObjectType {
  constructor(name, options) {
    if (!options) options = name;

    super('Mutation', options);
  }
}

module.exports = MutationType;
