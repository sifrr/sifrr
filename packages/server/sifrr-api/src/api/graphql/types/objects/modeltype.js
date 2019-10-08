const ObjectType = require('./objecttype');
const InterfaceType = require('./interfacetype');
const { objectToMap } = require('../../util');
const { all } = require('./alltypes');

class ModelType extends ObjectType {
  constructor(name, { interfaces, ...superOpts }) {
    if (all.get(name)) return all.get(name);

    super(name, superOpts);
    if (interfaces instanceof InterfaceType) interfaces = [interfaces];
    this.interfaces = objectToMap(interfaces, InterfaceType);
    this.interfaces.forEach(i => i.fields.forEach((f, name) => this.addField(name, f)));
  }
}

ModelType.type = 'model';

module.exports = ModelType;
