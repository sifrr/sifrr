const URLExt = {
  absolute: (base, relative) => {
    let stack = base.split('/'),
      parts = relative.split('/');
    stack.pop();
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] == '.')
        continue;
      if (parts[i] == '..')
        stack.pop();
      else
        stack.push(parts[i]);
    }
    return stack.join('/');
  },
  getRoutes: (url) => {
    if (url[0] != '/') {
      url = '/' + url;
    }
    let qIndex = url.indexOf('?');
    if (qIndex != -1) {
      url = url.substring(0, qIndex);
    }
    return url.split('/');
  }
};

module.exports = URLExt;
