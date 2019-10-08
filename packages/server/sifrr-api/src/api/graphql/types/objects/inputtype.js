const ObjectType = require('./objecttype');
const { all } = require('./alltypes');

class InputType extends ObjectType {
  constructor(name, opts) {
    if (all.get(name)) return all.get(name);

    super(name, opts);
  }
}

InputType.type = 'input';
InputType.prefix = 'input';

module.exports = InputType;
