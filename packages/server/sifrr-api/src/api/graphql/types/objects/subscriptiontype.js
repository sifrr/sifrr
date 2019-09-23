const ObjectType = require('./objecttype');

class SubscriptionType extends ObjectType {
  constructor(name, options) {
    if (!options) name = options;

    super('Subscription', options);
  }
}

module.exports = SubscriptionType;
