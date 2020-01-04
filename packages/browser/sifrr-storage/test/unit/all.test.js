const { availableStores, getStorage } = require('../../src/sifrr.storage');
const { parseGetData, parseSetValue } = require('../../src/utils/dataparser');
const JSONP = require('../../src/utils/json'),
  Storage = require('../../src/storages/storage').default;

describe('SifrrStorage', () => {
  before(() => {
    global.__document = global.document;
    global.document = undefined;
  });

  after(() => {
    global.document = global.__document;
  });

  describe('#new', () => {
    it('should return supported storage by default', () => {
      const x = getStorage();
      expect(x).to.be.an.instanceof(availableStores['indexeddb']);
      assert.equal(x.type, 'indexeddb');
    });

    Object.keys(availableStores).forEach(type => {
      it(`should return ${type} if ${type} is prioritized`, () => {
        const x = getStorage({ priority: [type] });
        expect(x).to.be.an.instanceof(availableStores[type]);
        assert.equal(x.type, type);

        const y = getStorage(type);
        expect(y).to.be.an.instanceof(availableStores[type]);
        assert.equal(y.type, type);
      });

      it("doesn't return the storage if not supported", () => {
        sinon.stub(availableStores[type].prototype, 'isSupported').returns(undefined);

        const y = getStorage(type);

        expect(y).to.not.be.an.instanceof(availableStores[type]);

        sinon.restore();
      });
    });
  });
});

describe('Parser', () => {
  const x = new Storage({ ttl: 100 });

  before(() => {
    global.__document = global.document;
    global.document = undefined;
  });

  after(() => {
    global.document = global.__document;
  });

  describe('#parseSetValue', () => {
    it('should return data with ttl', () => {
      assert.equal(parseSetValue('a').value, 'a');
      assert.equal(parseSetValue('a', 100).ttl, 100);
      expect(Date.now() - parseSetValue('a').createdAt).to.be.at.most(100);

      assert.equal(parseSetValue({ value: 'b' }).value, 'b');
      assert.equal(parseSetValue({ value: 'b' }, 100).ttl, 100);
      expect(Date.now() - parseSetValue('a').createdAt).to.be.at.most(100);
    });

    it('should return data with given ttl', () => {
      assert.deepEqual(parseSetValue({ value: 'b', ttl: 500 }).value, 'b');
      assert.deepEqual(parseSetValue({ value: 'b', ttl: 500 }, 300).ttl, 500);
    });
  });

  describe('#parseGetData', () => {
    it('returns value if present', () => {
      assert.deepEqual(parseGetData({ a: { value: 'b' } }), { a: 'b' });
    });

    it('returns if not present', () => {
      assert.deepEqual(parseGetData({ a: undefined }), { a: undefined });
    });
  });

  it('isSupported', () => {
    x.hasStore = () => false;
    expect(x.isSupported(false), 'returns false on isSupported if hasStore is false').to.be.false;
    expect(x.isSupported(true), 'returns true on isSupported if document is undefined').to.be.true;

    x.hasStore = () => true;
    expect(x.isSupported(false), 'returns true on isSupported if store is not undefined').to.be
      .true;
  });
});

describe('JSON', () => {
  it('returns value if not parsable', () => {
    assert.equal(JSONP.parse(null), null);
    assert.equal(JSONP.parse(undefined), undefined);
  });
});
