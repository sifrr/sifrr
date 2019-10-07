const ObjectType = require('./objecttype');
const InterfaceType = require('./interfacetype');
const Field = require('../field');
const { objectToMap } = require('../../util');

class ModelType extends ObjectType {
  constructor(name, { interfaces, ...superOpts }) {
    if (ObjectType.all.get(name)) return ObjectType.all.get(name);

    super(name, superOpts);
    if (interfaces instanceof InterfaceType) interfaces = [interfaces];
    this.interfaces = objectToMap(interfaces, InterfaceType);
    this.interfaces.forEach(i =>
      objectToMap(i.fields, Field).forEach((f, name) => this.addField(name, f))
    );
  }
}

ModelType.type = 'model';

module.exports = ModelType;
