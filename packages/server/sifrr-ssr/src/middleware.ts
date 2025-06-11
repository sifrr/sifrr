import { headerName, headerValue } from './constants';

// this = sifrr seo instance
export default (getUrl) => {
  return function (req, res, next) {
    // Don't render other requests than GET
    if (req.method !== 'GET') return next();

    const url = getUrl(req);
    const headers = req.headers;

    if (this.getShouldRenderCache(url, headers) === null) {
      res._end = res.end;
      res.end = (resp, encoding) => {
        if (res.hasHeader('content-type')) {
          const contentType = res.getHeader('content-type');
          if (contentType.indexOf('html') >= 0) {
            this.setShouldRenderCache(url, headers, true);
          } else {
            this.setShouldRenderCache(url, headers, false);
          }
        }
        res._end(resp, encoding);
      };
    }

    return this.render(url, headers)
      .then((html) => {
        if (html) {
          res.set(headerName, headerValue);
          res.send(html);
        } else {
          next();
        }
      })
      .catch((e) => {
        if (e.message === 'No Render') {
          next();
        } else next(e);
      });
  };
};
