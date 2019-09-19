const FieldType = require('./fieldtype');
const InterfaceType = require('./interfacetype');
const indentString = require('../indent');

class ObjectType {
  constructor(name, { fields = [], impl, indent = true } = {}) {
    this.name = name;

    this.impl = impl;
    this.fields =
      fields instanceof Set ? fields : new Set(fields.filter(f => f instanceof FieldType));
    if (impl instanceof InterfaceType) impl.fields.forEach(f => this.addField(f));
    this.indent = indent;
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
