const getRegex = (path: string) => {
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

const getDataMap = (path: string) => {
  const dataMap = [];
  path.split('/').forEach((r: string) => {
    if (r[0] === ':') {
      dataMap.push(r);
    } else if (r === '*' || r === '**' || r.match(/\(.*\)/)) {
      dataMap.push(r);
    }
  });
  return dataMap;
};

class RegexPath extends RegExp {
  public options: {
    delimiter: string;
  };
  private path: string;
  private dataMap: string[];

  constructor(path: string, options = {}) {
    super(getRegex(path));
    this.options = Object.assign({ delimiter: '/' }, options);
    this.path = path;
    this.dataMap = getDataMap(path);
  }

  testRoute(route: string) {
    const data: {
        regexGroups?: string[];
        [k: string]: string | string[];
        '*'?: string[];
        '**'?: string[];
      } = {},
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
