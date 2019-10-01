const ObjectType = require('./objecttype');

class InputType extends ObjectType {
  constructor(name, opts) {
    if (ObjectType.all.get(name)) return ObjectType.all.get(name);

    super(name, opts);
  }
}

InputType.type = 'input';
InputType.prefix = 'input';

module.exports = InputType;
