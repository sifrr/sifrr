const BaseApp = require('../../src/server/baseapp');
const baseapp = new BaseApp();

describe('speed test', () => {
  describe('#folder', () => {
    it('throws error when folder is not a directory', () => {
      expect(() => { baseapp.folder('', __filename); }).to.throw();
    });
  });

  describe('#post', () => {
    it('throws error cb is not a function', () => {
      expect(() => { baseapp.post('', ''); }).to.throw();
    });
  });

  describe('#listen', () => {
    it('calls with 3 arguments when given', () => {
      let cb;
      baseapp._listen = (a, b, c) => {
        cb = c;
      };
      baseapp.listen('http://localhost', 1111, () => {});

      expect(typeof cb).to.equal('function');
    });
  });

  describe('#close', () => {
    it('does nothing when no socket', () => {
      expect(() => { baseapp.close(); }).to.not.throw();
    });
  });

  describe('#file', () => {
    baseapp.get = () => {};

    it('pattern is added twice', () => {
      baseapp.file('ok1', 'ok');
      baseapp.file('ok1', 'oknew');

      expect(baseapp._staticPaths['ok1'][0]).to.equal('ok');
    });

    it('throws error if pattern is added twice with failOnDuplicateRoute', () => {
      expect(() => {
        baseapp.file('ok2', 'ok');
        baseapp.file('ok2', 'ok', { failOnDuplicateRoute: true });
      }).to.throw();
    });

    it('pattern is added twice with overwriteRoute', () => {
      baseapp.file('ok3', 'ok');
      baseapp.file('ok3', 'oknew', { overwriteRoute: true });

      expect(baseapp._staticPaths['ok3'][0]).to.equal('oknew');
    });
  });
});
