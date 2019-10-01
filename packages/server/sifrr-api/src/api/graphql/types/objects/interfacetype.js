const ObjectType = require('./objecttype');

class InterfaceType extends ObjectType {
  constructor(name, options = {}) {
    if (ObjectType.all.get(name)) return ObjectType.all.get(name);

    if (options.interfaces && (options.interfaces.length > 0 || options.interfaces.size > 0))
      throw Error('Interface can not implement other interfaces: ', name, options);

    super(name, options);
  }
}

InterfaceType.type = 'interface';
InterfaceType.prefix = 'interface';

module.exports = InterfaceType;
