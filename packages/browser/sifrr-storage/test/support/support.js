function save_localstorage() {
  window.localStorage.setItem('BrowserStorage1', '{"a": "b"}');
}

function save_cookies() {
  document.cookie = 'BrowserStorage1={"a": "b"}';
}

function save_websql() {
  let webSQL = window.openDatabase('bs', 1, 'whatever', 1 * 1024 * 1024);
  webSQL.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS BrowserStorage1 (key unique, value)');
    tx.executeSql('INSERT INTO BrowserStorage1(key, value) VALUES ("a", "b")');
  });
}

function save_indexeddb() {
  let req = indexedDB.deleteDatabase('BrowserStorage1');
  let request = indexedDB.open('BrowserStorage1', 1);
  request.onupgradeneeded = function(event) {
    let db = event.target.result;
    let table = db.createObjectStore('BrowserStorage1', { keyPath: 'key' });
    table.transaction.oncomplete = async function(event) {
      let store = db.transaction('BrowserStorage1', 'readwrite').objectStore('BrowserStorage1');
      store.add({key: 'a', value: 'b'});
    };
  };
}

function save_jsonstorage() {
  let storage = new BrowserStorage('jsonstorage');
  storage.insert('a', 'b');
}
