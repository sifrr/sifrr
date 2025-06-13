const getRegex = (path: string | RegExp): RegExp => {
  if (path instanceof RegExp) return path;
  return new RegExp(
    '^' +
      path
        .replace(/\/:\w+\?/g, '(?:/([^\\/]{0,}))?')
        .replace(/\*\*/g, '(.{0,})')
        .replace(/\*/g, '([^\\/]{0,})')
        .replace(/:\w+/g, '([^\\/]{0,})') +
      '$'
  );
};

const GROUP_REGEX = /\((<[a-zA-Z]+>)?[^)]*\)/g;

const getDataMap = (path: string, delimiter = '/') => {
  const dataMap: string[] = [];
  path.split(delimiter).forEach((r: string) => {
    if (r.startsWith(':') || r === '*' || r === '**') {
      if (r.endsWith('?')) {
        r = r.substring(0, r.length - 1);
      }
      return dataMap.push(r);
    }
    let m;
    while (null != (m = GROUP_REGEX.exec(r))) {
      dataMap.push(m[0]);
    }
  });
  return dataMap;
};

class RegexPath extends RegExp {
  public options: {
    delimiter?: string;
  };
  private readonly path: string | RegExp;
  private readonly dataMap: string[];

  constructor(path: string | RegExp, options = {}) {
    super(getRegex(path));
    this.options = options;
    this.path = path;
    this.dataMap = typeof path === 'string' ? getDataMap(path, this.options.delimiter) : [];
  }

  testRoute(route: string) {
    let data: {
      regexGroups?: string[];
      '*'?: string[];
      '**'?: string[];
      [k: string]: string | string[] | undefined;
    } = {};
    const match = this.exec(route);
    if (match) {
      match.forEach((m, i) => {
        if (i === 0) return;
        const d = this.dataMap[i - 1];
        if (d === '*') {
          data['*'] = data['*'] ?? [];
          data['*'].push(m);
        } else if (d === '**') {
          data['**'] = data['**'] ?? [];
          data['**'].push(m);
        } else if (d?.startsWith(':')) {
          data[d.substring(1)] = m;
        } else {
          data.regexGroups = data.regexGroups ?? [];
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
