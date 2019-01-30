const mediaTypes = ['image'];
const fetchTypes = ['xhr', 'fetch'];

function isTypeOf(request, types) {
  const resType = request.resourceType();
  return types.indexOf(resType) !== -1;
}

class PageRequest {
  constructor(npage) {
    this.npage = npage;
    this.pendingRequests = 0;
    this.pendingPromise = Promise.resolve(true);
    this.pendingResolver = require('./constants').noop;
    this.addOnRequestListener();
    this.addEndRequestListener();
  }

  addOnRequestListener() {
    const me = this;
    this.npage.setRequestInterception(true).then(() => {
      me.npage.on('request', (request) => {
        if (isTypeOf(request, mediaTypes)) {
          request.abort();
        } else if (isTypeOf(request, fetchTypes)) {
          me.pendingRequests++;
          me.pendingPromise = new Promise(res => me.pendingResolver = res);
          request.continue();
        } else {
          request.continue();
        }
      });
    });
  }

  addEndRequestListener() {
    // resolve pending fetch/xhrs
    const me = this;
    this.npage.on('requestfailed', request => {
      me.onEnd(request);
    });
    this.npage.on('requestfinished', request => {
      me.onEnd(request);
    });
  }

  onEnd(req) {
    if (isTypeOf(req, fetchTypes)) {
      this.pendingRequests--;
      if (this.pendingRequests === 0) {
        this.pendingResolver();
      }
    }
  }

  async all() {
    if (this.pendingRequests === 0) {
      return true;
    }
    await this.pendingPromise;
    return true;
  }
}

module.exports = PageRequest;
