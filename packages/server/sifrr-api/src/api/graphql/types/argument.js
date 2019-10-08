const { getStringType, objectToMap } = require('../util');

class Argument {
  static join(all = {}, separator = '\n') {
    const map = objectToMap(all, this);
    const schema = [];
    map.forEach((a, name) => {
      a.name = name;
      schema.push(a.getSchema());
    });
    return schema.join(separator);
  }

  constructor(type, { name, nullable = true, description, deprecated = false, defaultValue } = {}) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.nullable = nullable;
    this.deprecated = deprecated;
    this.defaultValue = defaultValue;
  }

  getSchema(suffix) {
    return `${this.description ? `"""\n${this.description}\n"""\n` : ''}${this.name}${
      suffix ? suffix : ''
    }${`${this.type ? ': ' : ''}${getStringType(this.type)}${this.nullable ? '' : '!'}${
      this.defaultValue
        ? ` = ${
            typeof this.defaultValue === 'string' ? `"${this.defaultValue}"` : this.defaultValue
          }`
        : ''
    }${this.deprecated ? ` @deprecated(reason: "${this.deprecated}")` : ''}`}`;
  }

  clone() {
    return new this.constructor(this.type, { ...this, args: this.arguments });
  }

  static from(obj = {}) {
    if (obj.args) {
      obj.args = objectToMap(obj.args, Argument);
    }

    if (obj instanceof this) return obj;

    return new this(obj.type, obj);
  }
}

module.exports = Argument;
