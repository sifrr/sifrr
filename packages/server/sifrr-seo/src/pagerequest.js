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
    this.pendingPromise = new Promise(res => this.pendingResolver = res);
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

  all() {
    if (this.pendingRequests === 0) return Promise.resolve(true);
    return this.pendingPromise;
  }
}

module.exports = PageRequest;
