const BaseType = require('./basetype');

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
        ? `: ${this.type}${this.nullable ? '' : '!'}${
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
    return new this(obj.name, obj.type, obj);
  }
}

module.exports = ArgumentType;
