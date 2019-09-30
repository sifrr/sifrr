const ObjectType = require('./objecttype');

class ConnectionType extends ObjectType {
  constructor(name, { edgeType, ...superOptions }) {
    if (!edgeType) throw Error('Connection must have An EdgeType');

    super(name, superOptions);

    this.edgeType = edgeType;
    this.addField('edges', {
      type: new ObjectType(`${name}Edge`, {
        fields: { node: { type: edgeType }, cursor: { type: 'String!' } }
      })
    });
  }
}

module.exports = ConnectionType;
