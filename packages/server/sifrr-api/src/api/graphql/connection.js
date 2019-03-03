const attrTypes = require('../attrtypes');
const flatten = require('../flatten');

class Connection {
  constructor(type, args, resolver, nodeType) {
    this.type = type;
    this.args = args;
    this._attributes = [];
    this.resolver = resolver;
    this.nodeType = nodeType;
    this.description;
  }

  clone(resolver) {
    const conn = new Connection(this.type, this.args, resolver, this.nodeType);
    conn._attributes = this._attributes;
    conn.description = this.description;
    return conn;
  }

  getArgs({ required = [], allowed = [] }) {
    return attrTypes(this.args, required, allowed);
  }

  addArg(name, type) {
    this.args[name] = type;
  }

  get attributes() {
    return attrTypes(this._attributes, this._reqAttrs, this._allowedAttrs);
  }

  addAttribute(name, attribute) {
    this._attributes[name] = attribute;
  }

  getResolvers() {
    const resolvers = {};
    for (let attr in this._attributes) {
      if (this._attributes[attr].resolver) resolvers[attr] = this._attributes[attr].resolver;
    }
    return resolvers;
  }

  getSchema() {
    const schema = `${this.description ? `""" ${this.description} """ \n` : '' }`;
    return schema + `type ${this.type} {
  edges: [${this.type + 'Edge'}]
  ${flatten(this.attributes, '\n  ', true)}
}

type ${this.type + 'Edge'} {
  node: ${this.nodeType}
  cursor: String
}`;
  }
}

module.exports = Connection;
