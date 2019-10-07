const ObjectType = require('./objecttype');
const ModelType = require('./modeltype');
const { toType } = require('../../util');

class ConnectionType extends ObjectType {
  constructor(name, { edgeType, ...superOptions }) {
    if (ObjectType.all.get(name)) return ObjectType.all.get(name);

    if (!edgeType) throw Error('Connection must have An EdgeType');
    super(name, superOptions);

    this.edgeType = toType(edgeType, ModelType);
    this.addField('edges', {
      type: new ModelType(`${name}Edge`, {
        fields: { node: { type: this.edgeType }, cursor: { type: 'String!' } }
      })
    });
  }
}

ConnectionType.type = 'connection';

module.exports = ConnectionType;
