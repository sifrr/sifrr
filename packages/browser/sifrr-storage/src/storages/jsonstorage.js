const Storage = require('./storage');

class JsonStorage extends Storage {
  constructor(options, data = {}) {
    super(options);
    this._upsert(this.constructor.parse(data));
  }

  _parsedData() {
    return this._table;
  }

  _compare(value, options) {
    if (typeof value == 'undefined' || typeof options == 'undefined') {
      return false;
    } else if (typeof options['='] != 'undefined') {
      let values;
      if (Array.isArray(options['='])) {
        values = options['='];
      } else {
        values = [options['=']];
      }
      if (values.includes(value)) return true;
    } else if (typeof options['>'] != 'undefined') {
      if (value > options['>']) return true;
    } else if (typeof options['<'] != 'undefined') {
      if (value < options['<']) return true;
    } else if (typeof options['>='] != 'undefined') {
      if (value >= options['>=']) return true;
    } else if (typeof options['<='] != 'undefined') {
      if (value <= options['<=']) return true;
    } else if (typeof options['~'] != 'undefined') {
      if (Array.isArray(value)) {
        if (value.includes(options['~'])) return true;
      } else if (typeof value == 'string') {
        if (value.indexOf(options['~']) > -1) return true;
      }
    } else {
      for (const key in options) {
        if (this._compare(value[key], options[key])) {
          return true;
        }
      }
    }
    return false;
  }

  get store() {
    return this._table;
  }

  get table() {
    return this._table || {};
  }

  set table(value) {
    this._table = value;
  }

  where(options) {
    let results = {};
    for (const key in this._table) {
      if (this._compare(this._table[key], options)) {
        results[key] = this._table[key];
      }
    }
    return new this.constructor({}, results);
  }

  static get type() {
    return 'jsonstorage';
  }
}

module.exports = JsonStorage;
