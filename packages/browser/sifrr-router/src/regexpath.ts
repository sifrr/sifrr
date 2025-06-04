const getRegex = (path: string | RegExp) => {
  if (path instanceof RegExp) return path;
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
  const dataMap: string[] = [];
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
  private readonly path: string | RegExp;
  private readonly dataMap: string[];

  constructor(path: string | RegExp, options = {}) {
    super(getRegex(path));
    this.options = { delimiter: '/', ...options };
    this.path = path;
    this.dataMap = typeof path === 'string' ? getDataMap(path) : [];
  }

  testRoute(route: string) {
    let data: {
        regexGroups?: string[];
        '*'?: string[];
        '**'?: string[];
        [k: string]: string | string[] | undefined;
      } = {},
      match = this.exec(route);
    if (match) {
      match.forEach((m, i) => {
        if (i === 0) return;
        const d = this.dataMap[i - 1];
        if (d === '*') {
          data['*'] = data['*'] || [];
          data['*'].push(m);
        } else if (d === '**') {
          data['**'] = data['**'] || [];
          data['**'].push(m);
        } else if (d?.startsWith(':')) {
          data[d.substring(1)] = match[i + 1];
        } else {
          data.regexGroups = data.regexGroups || [];
          data.regexGroups.push(m);
        }
      });
      data = {
        ...data,
        ...match.groups
      };
    }
    return {
      match: !!match,
      data: data
    };
  }
}

export default RegexPath;
