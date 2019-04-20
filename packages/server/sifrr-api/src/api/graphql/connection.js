const BaseType = require('./basetype');
const flatten = require('../flatten');

class Connection extends BaseType {
  constructor(type, args, resolver, nodeType) {
    super({});
    this.type = type;
    this.args = args;
    this.resolver = resolver;
    this.nodeType = nodeType;
    this.description;
  }

  clone(resolver = this.resolver) {
    const conn = new Connection(this.type, this.args, resolver, this.nodeType);
    conn._attributes = this._attributes;
    conn.description = this.description;
    conn.base = this;
    return conn;
  }

  addArgument(name, type) {
    this.args[name] = type;
  }

  getSchema() {
    return this.schemaPrefix + `type ${this.type} {
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
