const whiteTypes = ['document', 'script', 'xhr', 'fetch'];

function isTypeOf(request, types) {
  const resType = request.resourceType();
  return types.indexOf(resType) !== -1;
}

class PageRequest {
  constructor(npage, filter = () => true) {
    this.npage = npage;
    this.filter = filter;
    this.pendingRequests = 0;
    this.pendingPromise = new Promise(res => this.pendingResolver = res);
    this.addOnRequestListener();
    this.addEndRequestListener();
  }

  addOnRequestListener() {
    const me = this;
    this.addListener = this.npage.setRequestInterception(true).then(() => {
      me.npage.on('request', (request) => {
        if (isTypeOf(request, whiteTypes) && this.filter(request.url())) {
          me.pendingRequests++;
          request.__allowed = true;
          request.continue();
        } else {
          request.__allowed = false;
          request.abort();
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

  onEnd(request) {
    if (request.__allowed) {
      this.pendingRequests--;
      if (this.pendingRequests === 0) this.pendingResolver();
    }
  }

  all() {
    if (this.pendingRequests === 0) return Promise.resolve(true);
    return this.pendingPromise;
  }
}

module.exports = PageRequest;
