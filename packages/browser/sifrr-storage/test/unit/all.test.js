const SifrrStorage = require('../../src/sifrr.storage').default;
const JSONP = require('../../src/utils/json'),
  Storage = require('../../src/storages/storage').default;

describe('SifrrStorage', () => {
  describe('#new', () => {
    it('should return supported storage by default', () => {
      let x = new SifrrStorage();
      expect(x).to.be.an.instanceof(SifrrStorage.availableStores['indexeddb']);
      assert.equal(x.type, 'indexeddb');
    });

    Object.keys(SifrrStorage.availableStores).forEach(type => {
      it(`should return ${type} if ${type} is prioritized`, () => {
        let x = new SifrrStorage({ priority: [type] });
        expect(x).to.be.an.instanceof(SifrrStorage.availableStores[type]);
        assert.equal(x.type, type);

        let y = new SifrrStorage(type);
        expect(y).to.be.an.instanceof(SifrrStorage.availableStores[type]);
        assert.equal(y.type, type);
      });

      it("doesn't return the storage if not supported", () => {
        sinon.stub(SifrrStorage.availableStores[type].prototype, 'isSupported').returns(undefined);

        let y = new SifrrStorage(type);

        expect(y).to.not.be.an.instanceof(SifrrStorage.availableStores[type]);

        sinon.restore();
      });
    });

    it('throws error if no supported storages', () => {
      sinon.stub(SifrrStorage.prototype, 'supportedStore');

      expect(() => new SifrrStorage()).to.throw();

      sinon.restore();
    });
  });
});

describe('Storage', () => {
  let x = new Storage({ ttl: 100 });

  describe('#_parseSetValue', () => {
    it('should return data with ttl', () => {
      assert.deepEqual(x._parseSetValue('a'), { value: 'a', ttl: 100 });
      assert.deepEqual(x._parseSetValue({ value: 'b' }), { value: 'b', ttl: 100 });
    });

    it('should return data with given ttl', () => {
      assert.deepEqual(x._parseSetValue({ value: 'b', ttl: 500 }), { value: 'b', ttl: 500 });
    });
  });

  describe('#_parseSetData', () => {
    before(() => {
      x._oldparseSetValue = x._parseSetValue;
      x._parseSetValue = () => 'ok';
    });

    after(() => {
      x._parseSetValue = x._oldparseSetValue;
    });

    it('set value for key value', () => {
      assert.deepEqual(x._parseSetData('a', 'b'), { a: 'ok' });
    });

    it('set value for data', () => {
      assert.deepEqual(x._parseSetData({ a: 'b' }), { a: 'ok' });
    });
  });

  describe('#_parseGetData', () => {
    it('returns value if present', () => {
      assert.deepEqual(x._parseGetData({ a: { value: 'b' } }), { a: 'b' });
    });

    it('returns if not present', () => {
      assert.deepEqual(x._parseGetData({ a: null }), { a: null });
    });
  });

  it('isSupported', () => {
    expect(x.isSupported(false), 'returns false on isSupported if store is undefined').to.be.false;
    expect(x.isSupported(true), 'returns true on isSupported if document is undefined').to.be.true;

    x.store = true;
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
