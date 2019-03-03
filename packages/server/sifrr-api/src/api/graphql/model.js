const attrTypes = require('../attrtypes');
const flatten = require('../flatten');

class Model {
  constructor(type, attributes = {}, { queries = {}, mutations = {} }) {
    this.type = type;
    this._attributes = attributes;
    this.queries = queries;
    this.mutations = mutations;
    this.connections = [];
    this._allowedAttrs = [];
    this._reqAttrs = [];
    this.description;
  }

  filterAttributes({ allowed = [], required = [] }) {
    this._allowedAttrs = allowed;
    this._reqAttrs = required;
  }

  getFilteredAttributes({ required = [], allowed = [] }) {
    return attrTypes(this._attributes, required, allowed);
  }

  getResolvers() {
    const resolvers = {};
    for (let attr in this._attributes) {
      if (this._attributes[attr].resolver) resolvers[attr] = this._attributes[attr].resolver;
    }
    return resolvers;
  }

  get attributes() {
    return this.getFilteredAttributes({ required: this._reqAttrs, allowed: this._allowedAttrs });
  }

  addConnection(name, connection) {
    this.connections.push(connection);
    this._attributes[name] = connection;
  }

  addAttribute(name, attribute) {
    this._attributes[name] = attribute;
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
