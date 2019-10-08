const ObjectType = require('./objecttype');
const { all } = require('./alltypes');

class EnumType extends ObjectType {
  constructor(name, options) {
    if (all.get(name)) return all.get(name);

    super(name, options);
  }

  static from(options) {
    if (options.fields)
      for (const f in options.fields) {
        if (options.fields[f] && options.fields[f].type)
          throw Error(`Enum fields can not have type: ${name}`);
        else options.fields[f].type = null;
      }
    return super.from(options);
  }
}

EnumType.type = 'enum';
EnumType.prefix = 'enum';

module.exports = EnumType;
