const indentString = require('../../indent');
const BaseType = require('../basetype');
const FieldType = require('../fieldtype');

class ObjectType extends BaseType {
  constructor(name, { fields = [], impl, indent = true, resolver } = {}) {
    super(name);

    if (impl instanceof ObjectType) impl.fields.forEach(f => this.addField(f));
    this.impl = impl;
    this.fields =
      fields instanceof Set ? fields : new Set(fields.filter(f => f instanceof FieldType));
    this.indent = indent;
    this.resolver = resolver;
  }

  addField(field) {
    if (!(field instanceof FieldType)) throw Error('Field must be instance of FieldType');

    return this.fields.add(field);
  }

  removeField(field) {
    return this.fields.remove(field);
  }

  getSchema() {
    if (this.fields.size < 1) throw Error('Object must have atleast one field');

    return `${this.constructor.prefix} ${this.name}${
      this.impl ? ` implements ${this.impl.name}` : ''
    } {
${indentString(FieldType.join([...this.fields]))}
}`;
  }
}

ObjectType.prefix = 'type';

module.exports = ObjectType;
