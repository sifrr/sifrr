const ObjectType = require('./objecttype');

class SubscriptionType extends ObjectType {
  constructor(name, options) {
    if (!options) options = name;

    super('Subscription', options);
  }
}

module.exports = SubscriptionType;
