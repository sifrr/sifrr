import { HTTPRequest, Page, ResourceType } from 'puppeteer';

const whiteTypes: ResourceType[] = ['document', 'script', 'xhr', 'fetch'];

function isTypeOf(request: HTTPRequest, types: ResourceType[]): boolean {
  const resType = request.resourceType();
  return types.indexOf(resType) !== -1;
}

class PageRequest {
  addListener: any;
  npage: Page;
  filter: (url: string) => boolean;
  pendingRequests: number;
  pendingPromise: Promise<unknown>;
  pendingResolver?: (value?: unknown) => void;

  constructor(npage: Page, filter: (url: string) => boolean = () => true) {
    this.npage = npage;
    this.filter = filter;
    this.pendingRequests = 0;
    this.pendingPromise = new Promise((res) => (this.pendingResolver = res));
    this.addOnRequestListener();
    this.addEndRequestListener();
  }

  addOnRequestListener() {
    this.addListener = this.npage.setRequestInterception(true).then(() => {
      this.npage.on('request', (request: HTTPRequest & { __allowed?: boolean }) => {
        if (isTypeOf(request, whiteTypes) && this.filter(request.url())) {
          this.pendingRequests++;
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
    this.npage.on('requestfailed', (request) => {
      this.onEnd(request);
    });
    this.npage.on('requestfinished', (request) => {
      this.onEnd(request);
    });
  }

  onEnd(request: HTTPRequest & { __allowed?: boolean }) {
    if (request.__allowed) {
      this.pendingRequests--;
      if (this.pendingRequests === 0) this.pendingResolver?.();
    }
  }

  all() {
    if (this.pendingRequests === 0) return Promise.resolve(true);
    return this.pendingPromise;
  }
}

export default PageRequest;
