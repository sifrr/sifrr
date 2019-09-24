const BaseType = require('./basetype');
const { getType } = require('../util');

class ArgumentType extends BaseType {
  static join(all = [], separator = '\n') {
    return all.map(a => a.getSchema()).join(separator);
  }

  constructor(name, type, { nullable = true, description, deprecated = false, defaultValue } = {}) {
    super(name);

    this.type = type;
    this.description = description;
    this.nullable = nullable;
    this.deprecated = deprecated;
    this.defaultValue = defaultValue;
  }

  getSchema(suffix) {
    return `${this.description ? `"""\n${this.description}\n"""\n` : ''}${this.name}${
      suffix ? suffix : ''
    }${
      this.type
        ? `: ${getType(this.type)}${this.nullable ? '' : '!'}${
            this.defaultValue
              ? ` = ${
                  typeof this.defaultValue === 'string'
                    ? `"${this.defaultValue}"`
                    : this.defaultValue
                }`
              : ''
          }${this.deprecated ? ` @deprecated(reason: "${this.deprecated}")` : ''}`
        : ''
    }`;
  }

  static from(obj = {}) {
    if (Array.isArray(obj)) return obj.map(o => this.from(o));
    if (Array.isArray(obj.args)) obj.args = obj.args.map(o => ArgumentType.from(o));

    return new this(obj.name, obj.type, obj);
  }
}

module.exports = ArgumentType;
