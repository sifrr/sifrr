const ObjectType = require('./objecttype');
const { objectToMap } = require('../../util');

class ModelType extends ObjectType {
  constructor(name, { interfaces, ...superOpts }) {
    if (ObjectType.all.get(name)) return ObjectType.all.get(name);

    super(name, superOpts);
    this.interfaces = interfaces;
  }

  convertInterfaces() {
    const InterfaceType = require('./interfacetype');
    this.interfaces = objectToMap(this.interfaces, InterfaceType);
    this.interfaces.forEach(i => i.fields.forEach((f, name) => this.addField(name, f)));
  }
}

ModelType.prototype._getSchema = ModelType.prototype.getSchema;
ModelType.prototype.getSchema = function() {
  this.convertInterfaces();
  return this._getSchema();
};

ModelType.type = 'model';

module.exports = ModelType;
