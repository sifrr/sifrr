const getRegex = (path: string) => {
  return new RegExp(
    '^' +
      path
        .replace(/\/:\w\?/g, '(/[^/]{0,})?')
        .replace(/\*\*/g, '(.{0,})')
        .replace(/\*/g, '([^/]{0,})')
        .replace(/:\w/g, '([^/]{0,})') +
      '$'
  );
};

const getDataMap = (path: string) => {
  const dataMap = [];
  path.split('/').forEach((r: string) => {
    if (r.startsWith(':') || r === '*' || r === '**' || r.match(/\(.*\)/)) {
      dataMap.push(r);
    }
  });
  return dataMap;
};

class RegexPath extends RegExp {
  public options: {
    delimiter: string;
  };
  private readonly path: string;
  private readonly dataMap: string[];

  constructor(path: string, options = {}) {
    super(getRegex(path));
    this.options = { delimiter: '/', ...options };
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
        } else if (d.startsWith(':')) {
          data[d.substring(1)] = match[i + 1];
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
