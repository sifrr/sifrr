const Element = require('./element');

class SifrrDOM {
  constructor(name, html = null) {
    this.name = name;
    let route = name.split('-').join('/');
    this.html = typeof html === 'string' ? html : '/elements/' + route + '.html';
    if (Array.isArray(name)) {
      return name.map(e => new this.constructor(e));
    } else if (typeof name == 'object') {
      return Object.keys(name).map(k => new this.constructor(k, name[k]));
    }
    this._registerElement();
    this.constructor.add(name, this);
  }

  _registerElement() {
    this.customElement = new Element(this);
  }

  static add(name, instance) {
    this.elements[name] = instance;
  }
}

SifrrDOM.elements = {};

module.exports = SifrrDOM;
