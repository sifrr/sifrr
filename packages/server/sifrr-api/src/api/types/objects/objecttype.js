const indentString = require('../../indent');
const BaseType = require('../basetype');
const FieldType = require('../fieldtype');

class ObjectType extends BaseType {
  constructor(name, { fields = [], interfaces, indent = true, resolver, description } = {}) {
    if (ObjectType.get(name)) return ObjectType.get(name);

    super(name);
    ObjectType.add(this);
    this.fields = new Set([...fields].filter(f => f instanceof FieldType));
    this.interfaces =
      Array.isArray(interfaces) || interfaces instanceof Set
        ? new Set([...interfaces])
        : new Set(interfaces ? [interfaces] : []);
    this.interfaces.forEach(i => i.fields && i.fields.forEach(f => this.addField(f)));

    this.description = description;
    this.indent = indent;
    this.resolver = resolver;
  }

  addInterface() {}

  addField(field) {
    if (!(field instanceof FieldType)) throw Error('Field must be instance of FieldType');

    return this.fields.add(field);
  }

  removeField(field) {
    return this.fields.remove(field);
  }

  getSchema() {
    if (this.fields.size < 1) throw Error('Object must have atleast one field');

    return `${this.description ? `"""\n${this.description}\n"""\n` : ''}${
      this.constructor.prefix
    } ${this.name}${
      this.interfaces.size > 0
        ? ` implements ${[...this.interfaces].map(i => i.name).join(' & ')}`
        : ''
    } {
${indentString(FieldType.join([...this.fields]))}
}`;
  }

  static from(obj = {}) {
    if (Array.isArray(obj.fields)) obj.fields = obj.fields.map(f => FieldType.from(f));
    if (Array.isArray(obj.objects)) obj.objects = obj.objects.map(f => ObjectType.from(f));
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
