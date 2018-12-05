function save_localstorage() {
  window.localStorage.setItem('SifrrStorage1', '{"a": "b"}');
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
    let table = db.createObjectStore('SifrrStorage1', { keyPath: 'key' });
    table.transaction.oncomplete = async function(event) {
      let store = db.transaction('SifrrStorage1', 'readwrite').objectStore('SifrrStorage1');
      store.add({key: 'a', value: 'b'});
    };
  };
}

function save_jsonstorage() {
  let storage = new Sifrr.Storage('jsonstorage');
  storage.insert('a', 'b');
}
