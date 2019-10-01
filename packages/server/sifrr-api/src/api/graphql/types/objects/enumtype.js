const ObjectType = require('./objecttype');

class EnumType extends ObjectType {
  constructor(name, options) {
    if (ObjectType.all.get(name)) return ObjectType.all.get(name);

    if (options.fields)
      for (let f in options.fields) {
        if (options.fields[f] && options.fields[f].type)
          throw Error(`Enum fields can not have type: ${name}`);
        else options.fields[f].type = null;
      }

    super(name, options);
  }
}

EnumType.type = 'enum';
EnumType.prefix = 'enum';

module.exports = EnumType;
