const mock = require('mock-require');
mock('@sifrr/dom', window.Sifrr.Dom);
const Route = require('../../src/sifrr.route').SifrrRoute;
mock.stop('@sifrr/dom');

describe('Route', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('sets up properly', () => {
    assert(window.Sifrr.Dom.register.calledWith(Route), 'SifrrRoute is registered');
    assert(window.document.addEventListener.calledWith('click'), 'Click event is registered');
    assert(window.addEventListener.calledWith('popstate'), 'Popstate event is registered');
  });

  it('adds to all on connect and removes on disconnect', () => {
    const route = new Route();

    route.onConnect();
    expect(Route.all.has(route)).to.be.true;

    route.onDisconnect();
    expect(Route.all.has(route)).to.be.false;
  });

  it('on attributechange', () => {
    const route = new Route();

    assert.notExists(route.routeRegex);

    route.getAttribute = () => 'ok';
    sinon.stub(route, 'refresh');
    route.onAttributeChange('path');

    assert.exists(route.routeRegex);
    assert(route.refresh.calledOnce);

    route.onAttributeChange('some');
    assert(route.refresh.calledOnce, 'should not call refresh again');
  });

  describe('click evenlistener', () => {
    it('returns false if no history or pushState', () => {
      sinon.stub(window, 'history').value({});

      expect(Route.clickEventListener()).to.equal(false);

      sinon.stub(window, 'history').value(undefined);

      expect(Route.clickEventListener()).to.equal(false);
    });

    it('has correct target from composedPath or target', () => {
      const t1 = {
        matches: sinon.spy()
      };
      const t2 = {
        matches: sinon.spy()
      };
      Route.clickEventListener({
        composedPath: () => [t1],
        target: () => t2
      });

      assert(t1.matches.calledOnce, 'uses composedpath target when present');

      Route.clickEventListener({
        target: t2
      });

      assert(t2.matches.calledOnce, 'uses target when composedPath not present');
    });

    it('returns false if metaKey or ctrlKey used', () => {
      expect(Route.clickEventListener({ metaKey: true })).to.equal(false);
      expect(Route.clickEventListener({ ctrlKey: true })).to.equal(false);
    });

    it('returns false if target host and location host are not same', () => {
      expect(Route.clickEventListener({ target: { host: 'locl', matches: () => true } })).to.equal(
        false
      );
    });

    it('calls e preventDefault if everything is okay', () => {
      const spy = sinon.spy();
      Route.clickEventListener({
        target: {
          host: 'localhost',
          matches: () => true,
          getAttribute: () => 'new title',
          pathname: '/',
          href: '/?bang#hash'
        },
        preventDefault: spy
      });

      assert(spy.calledOnce);
      assert(
        window.history.pushState.calledWith(
          {
            pathname: '/',
            title: 'new title',
            href: '/?bang#hash'
          },
          'new title',
          '/?bang#hash'
        )
      );
      assert.equal(window.document.title, 'new title');
    });
  });
});
