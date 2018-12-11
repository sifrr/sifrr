let Sifrr = {};
Sifrr.Storage = require('../src/sifrr.storage');
const chai = require('chai'),
  assert = chai.assert,
  should = chai.should(),
  expect = chai.expect,
  JsonStorage = require('../src/storages/jsonstorage'),
  Storage = require('../src/storages/storage'),
  dummyData = require('./fixtures/dummy.json');

describe('Sifrr.Storage', () => {
  describe('#new', () => {
    it('should return supported storage by default', () => {
      let x = new Sifrr.Storage();
      expect(x).to.be.an.instanceof(Sifrr.Storage.availableStores['indexeddb']);
      assert.equal(x.type, 'indexeddb')
    });

    Object.keys(Sifrr.Storage.availableStores).forEach((type) => {
      it(`should return ${type} if ${type} is prioritized`, () => {
        let x = new Sifrr.Storage({priority: [type]});
        expect(x).to.be.an.instanceof(Sifrr.Storage.availableStores[type]);
        assert.equal(x.type, type);
      });
    });
  });

  describe('#all', () => {
    it('should return all instances there are', () => {
      Sifrr.Storage._all = [];
      new Sifrr.Storage({ priority: ['cookies'] });
      new Sifrr.Storage({ priority: ['indexeddb'] });
      assert.equal(Sifrr.Storage.all.length, 2);
    });
  });

  describe('#json', () => {
    it('should return jsonstorage', () => {
      let x = Sifrr.Storage.json({ a: 'b' });
      assert.equal(x.type, 'jsonstorage');
    });
  });
});

describe('JsonStorage', () => {
  let options = {
    name: 'Sifrr.Storage',
    version: 1
  }

  describe('#new', () => {
    it('should parse provided string', () => {
      let x = new JsonStorage(options, '{"a": "b"}');
      assert.equal(x.store['a'], 'b')
      let y = new JsonStorage(options, '[{"a": "b"}]');
      assert.equal(y.store[0]['a'], 'b')
    });

    it('should not parse provided object', () => {
      let x = new JsonStorage(options, {a: "b"});
      assert.equal(x.store['a'], 'b')
    });
  });
});

describe('Storage', () => {
  let x = new Storage();

  describe('#_parseKeyValue', () => {
    it('should return key if key is array and value is not there', () => {
      assert.deepEqual(x._parseKeyValue([0, 1, 2]), [0, 1, 2])
    });

    it('should return object if key is object and value is not there', () => {
      assert.deepEqual(x._parseKeyValue({a: 'b', c: 'd'}), {a: 'b', c: 'd'})
    });

    it('should return array if key is string and value is not there', () => {
      assert.deepEqual(x._parseKeyValue('a'), ['a'])
    });

    it('should return object if key is string and value is string', () => {
      assert.deepEqual(x._parseKeyValue('a', 'b'), {a: 'b'})
    });
  });
});
