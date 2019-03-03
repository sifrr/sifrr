const attrTypes = require('../attrtypes');

class BaseType {
  constructor(attributes) {
    this._attributes = attributes;
  }

  addAttribute(name, attribute) {
    this._attributes[name] = attribute;
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
}

module.exports = BaseType;
