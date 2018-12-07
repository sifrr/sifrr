const IndexedDB = require('./storages/indexeddb');
const WebSQL = require('./storages/websql');
const LocalStorage = require('./storages/localstorage');
const Cookies = require('./storages/cookies');
const JsonStorage = require('./storages/jsonstorage');

let storages = {};
storages[IndexedDB.type] = IndexedDB;
storages[WebSQL.type] = WebSQL;
storages[LocalStorage.type] = LocalStorage;
storages[Cookies.type] = Cookies;
storages[JsonStorage.type] = JsonStorage;

module.exports = storages;
