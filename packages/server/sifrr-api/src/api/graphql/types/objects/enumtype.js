const ObjectType = require('./objecttype');

class EnumType extends ObjectType {
  constructor(name, options) {
    if (options.fields)
      for (let f in options.fields) {
        if (options.fields[f] && options.fields[f].type)
          throw Error(`Enum fields can not have type: ${name}`);
      }

    super(name, options);
  }
}

EnumType.prefix = 'enum';

module.exports = EnumType;
