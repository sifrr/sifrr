const storages = require('./utils/storages');
const JsonStorage = require('./storages/jsonstorage');

/** Main BrowserStorage class. */
class SifrrStorage {
  /**
  * Get Storage instance based on options.
  * @param {json} options - Options.
  */
  constructor(options) {
    if (typeof options == 'string') options = { priority: [options] }; else options = options || {};
    this._options = Object.assign(this.constructor.defaultOptions, options);
    return this.storage;
  }

  get storage() {
    let storage = this.supportedStore();
    if (typeof storage == 'undefined') throw new Error('No available storage supported in this browser');
    let matchingInstance = this.constructor._matchingInstance(this._options, storage.type);
    if (matchingInstance) { return matchingInstance; }
    else {
      let storageInstance = new storage(this._options);
      this.constructor._add(storageInstance);
      return storageInstance;
    }
  }

  get priority() {
    return this._options.priority.concat(['indexeddb', 'websql', 'localstorage', 'cookies', 'jsonstorage']);
  }

  supportedStore() {
    for (let i = 0; i < this.priority.length; i++) {
      let store = this.constructor.availableStores[this.priority[i]];
      if (store && new store(this._options).isSupported()) return store;
    }
  }

  static _matchingInstance(options, type) {
    let allInstances = this.all, i;
    let length = allInstances.length;
    for (i = 0; i < length; i++) {
      if (allInstances[i]._isEqual(options, type)) return allInstances[i];
    }
    return false;
  }

  static _add(instance) {
    this._all = this._all || [];
    this._all.push(instance);
  }

  static get availableStores() {
    return storages;
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

  static get all() {
    return this._all || [];
  }

  static json(data) {
    return new JsonStorage({}, data);
  }
}

module.exports = SifrrStorage;
