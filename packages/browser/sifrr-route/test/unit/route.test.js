// Stub document methods
global.document = {
  addEventListener: sinon.stub()
};

// Stub Sifrr
global.window = {
  addEventListener: sinon.stub(),
  location: {
    href: '/'
  },
  Sifrr: {
    Dom: {
      Element: Object,
      html: sinon.stub(),
      register: sinon.stub()
    }
  }
};


describe('Route', () => {
  after(() => {
    sinon.restore();
  });

  it('sets up properly', () => {
    const Route = require('../../src/sifrr.route');

    assert(window.Sifrr.Dom.register.calledWith(Route), 'SifrrRoute is registered');
    assert(document.addEventListener.calledWith('click'), 'Click event is registered');
    assert(window.addEventListener.calledWith('popstate'), 'Popstate event is registered');
  });

  it('adds to all on connect and removes on disconnect', () => {
    const Route = require('../../src/sifrr.route');
    const route = new Route();

    route.onConnect();
    expect(Route.all.indexOf(route)).to.be.above(-1);

    route.onDisconnect();
    expect(Route.all.indexOf(route)).to.equal(-1);
  });
});
