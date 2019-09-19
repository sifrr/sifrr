class ArgumentType {
  static join(all = [], separator = '\n') {
    return all.map(a => a.getSchema()).join(separator);
  }

  constructor(name, type, { nullable = true, description, deprecated = false } = {}) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.nullable = nullable;
    this.deprecated = deprecated;
  }

  getSchema(suffix) {
    return `${this.description ? `"""${this.description}"""\n` : ''}${this.name}${
      suffix ? suffix : ''
    }: ${this.type}${this.nullable ? '' : '!'}${
      this.deprecated ? ` @deprecated(reason: "${this.deprecated}")` : ''
    }`;
  }
}

module.exports = ArgumentType;
