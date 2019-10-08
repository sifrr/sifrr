const ObjectType = require('./objecttype');
const ModelType = require('./modeltype');
const { toType } = require('../../util');
const { all } = require('./alltypes');

class ConnectionType extends ObjectType {
  constructor(name, { edgeType, ...superOptions }) {
    if (all.get(name)) return all.get(name);

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
