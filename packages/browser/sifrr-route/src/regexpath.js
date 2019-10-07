const getRegex = path => {
  return new RegExp(
    '^' +
      path
        .replace(/\/:[A-Za-z0-9_]{0,}\?/g, '(/[^/]{0,})?')
        .replace(/\*\*/g, '(.{0,})')
        .replace(/\*/g, '([^/]{0,})')
        .replace(/:[A-Za-z0-9_]{0,}/g, '([^/]{0,})') +
      '$'
  );
};

const getDataMap = path => {
  const dataMap = [];
  path.split('/').forEach(r => {
    if (r[0] === ':') {
      dataMap.push(r);
    } else if (r === '*' || r === '**' || r.match(/\(.*\)/)) {
      dataMap.push(r);
    }
  });
  return dataMap;
};

class RegexPath extends RegExp {
  constructor(path, options = {}) {
    super(getRegex(path));
    this.options = Object.assign({ delimiter: '/' }, options);
    this.path = path;
    this.dataMap = getDataMap(path);
  }

  test(route) {
    const data = {},
      match = this.exec(route);
    if (match) {
      this.dataMap.forEach((d, i) => {
        if (d === '*') {
          data['*'] = data['*'] || [];
          data['*'].push(match[i + 1]);
        } else if (d === '**') {
          data['**'] = data['**'] || [];
          data['**'].push(match[i + 1]);
        } else if (d[0] === ':') {
          data[d.substr(1)] = match[i + 1];
        } else {
          data.regexGroups = data.regexGroups || [];
          data.regexGroups.push(match[i + 1]);
        }
      });
    }
    return {
      match: !!match,
      data: data
    };
  }
}

export default RegexPath;
