const BaseApp = require('../../src/server/baseapp');
const baseapp = new BaseApp();

describe('speed test', () => {
  describe('#folder', () => {
    it('throws error when folder is not a directory', () => {
      expect(() => { baseapp.folder('', __filename) }).to.throw();
    });
  });

  describe('#post', () => {
    it('throws error cb is not a function', () => {
      expect(() => { baseapp.post('', '') }).to.throw();
    });
  });

  describe('#listen', () => {
    it('calls with 3 arguments when given', () => {
      let cb;
      baseapp._listen = (a, b, c) => {
        cb = c;
      }
      baseapp.listen('http://localhost', 1111, () => {});

      expect(typeof cb).to.equal('function');
    });
  });

  describe('#close', () => {
    it('does nothing when no socket', () => {
      expect(() => { baseapp.close() }).to.not.throw();
    });
  });
});
