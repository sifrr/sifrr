const { indent: indentString, objectToMap } = require('../../util');
const BaseType = require('./basetype');
const FieldType = require('../field');

class ObjectType extends BaseType {
  constructor(name, { fields = {}, interfaces, indent = true, resolver, description } = {}) {
    super(name);

    this.fields = objectToMap(fields, FieldType);
    this.interfaces = new Set();
    Array.isArray(interfaces) || interfaces instanceof Set
      ? [...interfaces].forEach(i => this.addInterface(i))
      : interfaces
      ? this.addInterface(interfaces)
      : null;

    this.description = description;
    this.indent = indent;
    this.resolver = resolver;
  }

  addInterface(intf) {
    this.interfaces.add(intf);
    intf.fields && intf.fields.forEach((f, name) => this.addField(name, f));
  }

  addField(name, field) {
    if (!(field instanceof FieldType)) {
      return this.addField(name, FieldType.from(field));
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
    return new this.constructor(name, { fields: this.getFilteredFields(filter), ...opts });
  }

  getFilteredFields(filterFxn = () => true) {
    const newFields = new Map(this.fields);
    const keys = this.fields.keys();
    for (let name of keys) {
      if (!filterFxn(name)) newFields.delete(name);
    }
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
      [...this.interfaces].length > 0
        ? ` implements ${[...this.interfaces].map(i => i.name).join(' & ')}`
        : ''
    } {
${indentString(FieldType.join(this.fields))}
}`;
  }

  static from(obj = {}) {
    const InterfaceType = require('./interfacetype');

    if (Array.isArray(obj) || obj instanceof Set) return [...obj].map(o => this.from(o));
    if (obj.fields) obj.fields = FieldType.from(obj.fields);
    if (obj.types) obj.types = ObjectType.from(obj.types);
    if (obj.interfaces) obj.interfaces = InterfaceType.from(obj.interfaces);
    if (obj.edgeType) obj.edgeType = ObjectType.from(obj.edgeType);
    return new this(obj.name, obj);
  }
}

ObjectType.prefix = 'type';

module.exports = ObjectType;
