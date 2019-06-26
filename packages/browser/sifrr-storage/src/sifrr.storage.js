const storages = require('./storages');
const JsonStorage = require('./storages/jsonstorage');

class SifrrStorage {
  constructor(options) {
    if (typeof options === 'string') options = { priority: [options] };
    else options = options || {};
    this._options = Object.assign(this.constructor.defaultOptions, options);
    return this.storage;
  }

  get storage() {
    let storage = this.supportedStore();
    if (typeof storage === 'undefined')
      throw Error('No available storage supported in this browser');
    let matchingInstance = this.constructor._matchingInstance(this._options, storage.type);
    if (matchingInstance) {
      return matchingInstance;
    } else {
      let storageInstance = new storage(this._options);
      this.constructor._add(storageInstance);
      return storageInstance;
    }
  }

  get priority() {
    return this._options.priority.concat([
      'indexeddb',
      'websql',
      'localstorage',
      'cookies',
      'jsonstorage'
    ]);
  }

  supportedStore() {
    for (let i = 0; i < this.priority.length; i++) {
      let store = this.constructor.availableStores[this.priority[i]];
      if (store && new store(this._options).isSupported()) return store;
    }
  }

  static _matchingInstance(options, type) {
    let allInstances = this.all,
      i;
    let length = allInstances.length;
    for (i = 0; i < length; i++) {
      if (allInstances[i]._isEqual(options, type)) return allInstances[i];
    }
    return false;
  }

  static _add(instance) {
    this.all.push(instance);
  }

  static get defaultOptions() {
    return {
      priority: [],
      name: 'SifrrStorage',
      version: 1,
      description: 'Sifrr Storage',
      size: 5 * 1024 * 1024
    };
  }

  static json(data) {
    return new JsonStorage({}, data);
  }
}

SifrrStorage.availableStores = storages;
SifrrStorage.all = [];

module.exports = SifrrStorage;
