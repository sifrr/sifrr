const { getType, objectToMap } = require('../util');

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
    if (!this.name || !this.type) {
      console.error(this);
      throw new Error('Argument must have a name and type');
    }

    return `${this.description ? `"""\n${this.description}\n"""\n` : ''}${this.name}${
      suffix ? suffix : ''
    }${`: ${getType(this.type)}${this.nullable ? '' : '!'}${
      this.defaultValue
        ? ` = ${
            typeof this.defaultValue === 'string' ? `"${this.defaultValue}"` : this.defaultValue
          }`
        : ''
    }${this.deprecated ? ` @deprecated(reason: "${this.deprecated}")` : ''}`}`;
  }

  static from(obj = {}) {
    if (!obj.type) {
      const all = objectToMap(obj, this);
      const newMap = new Map();
      all.forEach((arg, name) => newMap.set(name, this.from(arg)));
    }
    if (obj.args) {
      obj.args = Argument.from(obj.args);
    }

    return new this(obj.type, obj);
  }
}

module.exports = Argument;
