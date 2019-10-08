const { indent: indentString, objectToMap } = require('../../util');
const BaseType = require('./basetype');
const Field = require('../field');

class ObjectType extends BaseType {
  constructor(name, { fields = {}, indent = true, resolver, description } = {}) {
    if (BaseType.all.get(name)) return BaseType.all.get(name);

    super(name);
    this.fields = objectToMap(fields, Field);
    this.description = description;
    this.indent = indent;
    this.resolver = resolver;
  }

  addField(name, field) {
    if (!(field instanceof Field)) {
      return this.addField(name, Field.from(field));
    }
    field.name = name;
    return this.fields.set(name, field);
  }

  removeField(field) {
    if (typeof field === 'string') {
      this.fields.delete(field);
    }

    return this.fields.delete(field.name);
  }

  clone(name, opts, filter) {
    return new this.constructor(name, { ...opts, fields: this.getFilteredFields(filter) });
  }

  getFilteredFields(filterFxn = () => true) {
    const newFields = new Map();
    this.fields.forEach((f, k) => {
      if (filterFxn(k)) newFields.set(k, f.clone());
    });
    return newFields;
  }

  getFieldResolvers() {
    const resolvers = {};
    this.fields.forEach(f => {
      if (f.resolver) resolvers[f.name] = f.resolver;
    });
    return resolvers;
  }

  getSchema() {
    if (this.fields.size < 1) {
      throw Error(`Object must have atleast one field: ${this.name}`);
    }
    return `${this.description ? `"""\n${this.description}\n"""\n` : ''}${
      this.constructor.prefix
    } ${this.name}${
      this.interfaces && this.interfaces.size > 0
        ? ` implements ${[...this.interfaces.values()].map(i => i.name).join(' & ')}`
        : ''
    } {
${indentString(Field.join(this.fields))}
}`;
  }

  static from(obj) {
    if (obj instanceof this) return obj;
    return new this(obj.name, obj);
  }
}

ObjectType.type = 'object';
ObjectType.prefix = 'type';

module.exports = ObjectType;
