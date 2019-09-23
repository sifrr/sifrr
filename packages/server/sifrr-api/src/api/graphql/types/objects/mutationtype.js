const ObjectType = require('./objecttype');

class MutationType extends ObjectType {
  constructor(name, options) {
    if (!options) name = options;

    super('Mutation', options);
  }
}

module.exports = MutationType;
