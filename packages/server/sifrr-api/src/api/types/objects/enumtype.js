const ObjectType = require('./objecttype');

class EnumType extends ObjectType {
  constructor(name, options) {
    if (options.fields)
      options.fields.forEach(f => {
        if (f.type) throw Error('Enum fields can not have type');
      });

    super(name, options);
  }
}

EnumType.prefix = 'enum';

module.exports = EnumType;
