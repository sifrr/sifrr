const ObjectType = require('./objecttype');

class InterfaceType extends ObjectType {
  constructor(name, options = {}) {
    if (options.impl) throw Error('Interface can not implement other interface');

    super(name, options);
  }
}

InterfaceType.prefix = 'interface';

module.exports = InterfaceType;
