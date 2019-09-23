const indentString = require('../../../indent');
const BaseType = require('../basetype');
const FieldType = require('../fieldtype');

class ObjectType extends BaseType {
  constructor(name, { fields = [], interfaces, indent = true, resolver, description } = {}) {
    if (ObjectType.get(name)) return ObjectType.get(name);

    super(name);
    ObjectType.add(this);
    this.fields = new Set([...fields].filter(f => f instanceof FieldType));
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
    intf.fields && intf.fields.forEach(f => this.addField(f));
  }

  addField(field) {
    if (!(field instanceof FieldType)) throw Error('Field must be instance of FieldType');

    return this.fields.add(field);
  }

  removeField(field) {
    return this.fields.remove(field);
  }

  getSchema() {
    if (this.fields.size < 1) {
      throw Error('Object must have atleast one field: ', this);
    }

    return `${this.description ? `"""\n${this.description}\n"""\n` : ''}${
      this.constructor.prefix
    } ${this.name}${
      [...this.interfaces].length > 0
        ? ` implements ${[...this.interfaces].map(i => i.name).join(' & ')}`
        : ''
    } {
${indentString(FieldType.join([...this.fields]))}
}`;
  }

  static from(obj = {}) {
    const InterfaceType = require('./interfacetype');

    if (Array.isArray(obj) || obj instanceof Set) return [...obj].map(o => this.from(o));
    if (obj.fields) obj.fields = FieldType.from([...obj.fields]);
    if (obj.types) obj.types = ObjectType.from([...obj.types]);
    if (obj.interfaces) obj.interfaces = InterfaceType.from(obj.interfaces);
    if (obj.edgeType) obj.edgeType = ObjectType.from(obj.edgeType);
    return new this(obj.name, obj);
  }

  static add(obj) {
    this.all[obj.name] = obj;
  }

  static get(name) {
    return this.all[name];
  }
}

ObjectType.prefix = 'type';
ObjectType.all = {};

module.exports = ObjectType;
