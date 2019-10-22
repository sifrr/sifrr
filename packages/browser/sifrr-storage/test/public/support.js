function save_localstorage() {
  window.localStorage.setItem('SifrrStorage1/a', '{"value":"b"}');
}

function save_cookies() {
  document.cookie = 'SifrrStorage1/a={"value":"b"}';
}

function save_websql() {
  let webSQL = window.openDatabase('ss', 1, 'whatever', 1 * 1024 * 1024);
  webSQL.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS SifrrStorage1 (key unique, value)');
    tx.executeSql('INSERT INTO SifrrStorage1(key, value) VALUES ("a", \'{"value":"b"}\')');
  });
}

function save_indexeddb() {
  indexedDB.deleteDatabase('SifrrStorage1');
  let request = indexedDB.open('SifrrStorage1', 1);
  request.onupgradeneeded = function(event) {
    let db = event.target.result;
    let table = db.createObjectStore('SifrrStorage1');
    table.transaction.oncomplete = async function() {
      let store = db.transaction('SifrrStorage1', 'readwrite').objectStore('SifrrStorage1');
      store.add({ value: 'b' }, 'a');
    };
  };
}

function save_jsonstorage() {
  let storage = new Sifrr.Storage('jsonstorage');
  storage._table = { a: { value: 'b' } };
}

function arrayEqual(buf1, buf2) {
  if (typeof buf1 !== 'object') return buf1 === buf2;
  if (buf1 instanceof window.Blob) {
    return buf1.type === buf2.type && buf1.size === buf2.size;
  }
  if (Array.isArray(buf1)) {
    for (let i = 0; i < buf1.length; i++) {
      if (buf1[i] !== buf2[i]) return false;
    }
    return true;
  }
  if (buf1.byteLength != buf2.byteLength) return false;
  let dv1 = new Int8Array(buf1);
  let dv2 = new Int8Array(buf2);
  for (let i = 0; i < buf1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) return false;
  }
  return true;
}

const ab = new ArrayBuffer(16);
window.AllDataTypes = {
  Array: [1, 2, 3, 'a', 'b', '1234'],
  ArrayBuffer: ab,
  Blob: new Blob(['abcd'], { type: 'text/html' }),
  Float32Array: new Float32Array(ab),
  Float64Array: new Float64Array(ab),
  Int8Array: new Int8Array(ab),
  Int16Array: new Int16Array(ab),
  Int32Array: new Int32Array(ab),
  Number: 1234,
  Object: { a: 'b' },
  Uint8Array: new Uint8Array(ab),
  Uint8ClampedArray: new Uint8ClampedArray(ab),
  Uint16Array: new Uint16Array(ab),
  Uint32Array: new Uint32Array(ab),
  String: `<html lang="en" dir="ltr"><head>
    <meta charset="utf-8">`
};

window.LF = {
  websql: window.localforage.createInstance({ driver: window.localforage.WEBSQL }),
  indexeddb: window.localforage.createInstance({ driver: window.localforage.INDEXEDDB }),
  localstorage: window.localforage.createInstance({ driver: window.localforage.LOCALSTORAGE })
};

window.delay = time => new Promise(res => setTimeout(res, time));
