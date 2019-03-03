const BaseType = require('./basetype');
const flatten = require('../flatten');

class Model extends BaseType {
  constructor(type, attributes = {}, { queries = {}, mutations = {} }) {
    super(attributes);
    this.type = type;
    this.queries = queries;
    this.mutations = mutations;
    this.connections = [];
    this._allowedAttrs = [];
    this._reqAttrs = [];
    this.description;
  }

  addConnection(name, connection) {
    this.connections.push(connection);
    this._attributes[name] = connection;
  }

  addQuery(name, query) {
    this.queries[name] = query;
  }

  addMutation(name, mutation) {
    this.mutations[name] = mutation;
  }

  getSchema() {
    const schema = `${this.description ? `""" ${this.description} """ \n` : '' }`;
    return schema + `type ${this.type} {
  ${flatten(this.attributes, '\n  ', true)}
}`;
  }
}

module.exports = Model;
