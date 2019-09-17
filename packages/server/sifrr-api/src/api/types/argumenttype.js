class ArgumentType {
  static join(all = []) {
    return all.map(a => a.getSchema()).join(this.separator);
  }

  constructor(name, type, { required = false, description, deprecated = false } = {}) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.required = required;
    this.deprecated = deprecated;
  }

  getSchema(suffix) {
    return `${this.description ? `"""${this.description}"""\n` : ''}${this.name}${
      suffix ? suffix : ''
    }: ${this.type}${this.required ? '!' : ''}${
      this.deprecated ? ` @deprecated(reason: "${this.deprecated}")` : ''
    }`;
  }
}

ArgumentType.separator = '\n';

module.exports = ArgumentType;
