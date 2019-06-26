class RegexPath {
  constructor(path, options = {}) {
    this.options = Object.assign({ delimiter: '/' }, options);
    this.path = path;
  }

  get regex() {
    this._regex =
      this._regex ||
      new RegExp(
        '^' +
          this.path
            .replace(/\/:[A-Za-z0-9_]{0,}\?/g, '(/[^/]{0,})?')
            .replace(/\*\*/g, '(.{0,})')
            .replace(/\*/g, '([^/]{0,})')
            .replace(/:[A-Za-z0-9_]{0,}/g, '([^/]{0,})') +
          '$'
      );
    return this._regex;
  }

  get dataMap() {
    if (this._dataMap) return this._dataMap;
    this._dataMap = [];
    this.path.split('/').forEach(r => {
      if (r[0] === ':') {
        this._dataMap.push(r);
      } else if (r === '*' || r === '**' || r.match(/\(.*\)/)) {
        this._dataMap.push(r);
      }
    });
    return this._dataMap;
  }

  test(route) {
    const data = {},
      match = this.regex.exec(route);
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

module.exports = RegexPath;
