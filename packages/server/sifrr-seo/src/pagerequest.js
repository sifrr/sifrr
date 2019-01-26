const mediaTypes = ['image'];
const fetchTypes = ['xhr', 'fetch'];
let pendingRequests = 0;
let pendingPromise = Promise.resolve(true);
let pendingResolver = require('./constants').noop;

function isTypeOf(request, types) {
  const resType = request.resourceType();
  return types.indexOf(resType) !== -1;
}

function onEnd(request) {
  if (isTypeOf(request, fetchTypes)) {
    pendingRequests--;
    if (pendingRequests === 0) {
      pendingResolver();
    }
  }
}

module.exports = async (page) => {
  // Don't load images
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (isTypeOf(request, mediaTypes)) {
      request.abort();
    } else if (isTypeOf(request, fetchTypes)) {
      pendingRequests++;
      pendingPromise = new Promise(res => pendingResolver = res);
      request.continue();
    } else {
      request.continue();
    }
  });

  // resolve pending fetch/xhrs
  page.on('requestfailed', request => {
    onEnd(request);
  });
  page.on('requestfinished', request => {
    onEnd(request);
  });

  page.allFetchComplete = async () => {
    if (pendingRequests === 0) {
      return true;
    }
    return pendingPromise;
  };
};
