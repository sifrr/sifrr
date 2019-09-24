const ObjectType = require('./objecttype');
const FieldType = require('../fieldtype');

class ConnectionType extends ObjectType {
  constructor(name, { edgeType, ...superOptions }) {
    if (!edgeType) throw Error('Connection must have An EdgeType');

    super(name, superOptions);

    this.edgeType = edgeType;
    this.fields.add(
      new FieldType('edges', [
        new ObjectType(`${name}Edge`, {
          fields: [{ name: 'node', type: edgeType }, { name: 'cursor', type: 'String!' }]
        })
      ])
    );
  }
}

module.exports = ConnectionType;
