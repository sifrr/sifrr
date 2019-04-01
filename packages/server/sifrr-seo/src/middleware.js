const { headerName, headerValue } = require('./constants');

// this = sifrr seo instance
module.exports = function(req, res, next) {
  // Don't render other requests than GET
  if (req.method !== 'GET') return next();

  const renderReq = {
    fullUrl: this.renderer.options.fullUrl(req),
    headers: req.headers
  };

  if (this.getShouldRenderCache(renderReq) === null) {
    res._end = res.end;
    res.end = (resp, encoding) => {
      if (res.hasHeader('content-type')) {
        const contentType = res.getHeader('content-type');
        if (contentType.indexOf('html') >= 0) {
          this.setShouldRenderCache(renderReq, true);
        } else {
          this.setShouldRenderCache(renderReq, false);
        }
      }
      res._end(resp, encoding);
    };
  }

  return this.render(renderReq).then((html) => {
    if (html) {
      res.set(headerName, headerValue);
      res.send(html);
    } else {
      next();
    }
  }).catch((e) => {
    if (e.message === 'No Render') {
      next();
    } else next(e);
  });
};
