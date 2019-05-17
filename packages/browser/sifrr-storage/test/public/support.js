function save_localstorage() {
  window.localStorage.setItem('SifrrStorage1/a', 'b');
}

function save_cookies() {
  document.cookie = 'SifrrStorage1={"a": "b"}';
}

function save_websql() {
  let webSQL = window.openDatabase('bs', 1, 'whatever', 1 * 1024 * 1024);
  webSQL.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS SifrrStorage1 (key unique, value)');
    tx.executeSql('INSERT INTO SifrrStorage1(key, value) VALUES ("a", "b")');
  });
}

function save_indexeddb() {
  let req = indexedDB.deleteDatabase('SifrrStorage1');
  let request = indexedDB.open('SifrrStorage1', 1);
  request.onupgradeneeded = function(event) {
    let db = event.target.result;
    let table = db.createObjectStore('SifrrStorage1');
    table.transaction.oncomplete = async function() {
      let store = db.transaction('SifrrStorage1', 'readwrite').objectStore('SifrrStorage1');
      store.add('b', 'a');
    };
  };
}

function save_jsonstorage() {
  let storage = new Sifrr.Storage('jsonstorage');
  storage.set('a', 'b');
}

function arrayEqual(buf1, buf2) {
  if (buf1.byteLength != buf2.byteLength) return false;
  let dv1 = new Int8Array(buf1);
  let dv2 = new Int8Array(buf2);
  for (let i = 0 ; i < buf1.byteLength ; i++) {
    if (dv1[i] != dv2[i]) return false;
  }
  return true;
}

const ab = new ArrayBuffer(16);
window.AllDataTypes = {
  Array: [ 1, 2, 3 ],
  ArrayBuffer: ab,
  Blob: new Blob(['abcd']),
  Float32Array: new Float32Array(ab),
  Float64Array: new Float64Array(ab),
  Int8Array: new Int8Array(ab),
  Int16Array: new Int16Array(ab),
  Int32Array: new Int32Array(ab),
  Number: new Number(1234),
  Object: { a: 'b' },
  Uint8Array: new Uint8Array(ab),
  Uint8ClampedArray: new Uint8ClampedArray(ab),
  Uint16Array: new Uint16Array(ab),
  Uint32Array: new Uint32Array(ab),
  String: new String('string')
};
