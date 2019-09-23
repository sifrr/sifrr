const ObjectType = require('./objecttype');
const FieldType = require('../fieldtype');

class ConnectionType extends ObjectType {
  constructor(name, { edgeType, ...superOptions }) {
    if (!edgeType) throw Error('Connection must have An EdgeType');

    super(name, superOptions);

    this.edgeType = edgeType;
    this.fields.add(new FieldType('edges', `[${edgeType.name}]`));
  }
}

module.exports = ConnectionType;
