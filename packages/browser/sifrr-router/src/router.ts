import RegexPath from '@/regexpath';
import { SifrrElementKlass, store } from '@sifrr/dom';

export const STORE_NAME = 'sifrr-router';

export type SifrrPath = Pick<Location, 'pathname' | 'hash' | 'search' | 'href'>;

export type Current = {
  matchedRoute: Omit<Route, 'children'> & {
    pathRegex: RegexPath;
  };
  title: string;
  path: string;
  data: ReturnType<typeof RegexPath.prototype.testRoute>['data'];
  query: Record<string, string | string[] | null>;
  hash: string;
  meta?: Record<string, unknown>;
};

export type Route = {
  path: string | RegExp;
  title?: string;
  component?:
    | string
    | SifrrElementKlass<any>
    | (() => SifrrElementKlass<any> | Promise<SifrrElementKlass<any>>);
  meta?: Record<string, unknown>;
  getProps?: (data?: Current) => unknown;
  children?: Route[];
};

export type Options = {
  routes: Route[];
  before?: () => void;
  after?: () => void;
};

export const getFlatRoutes = (routes: Route[], prefix = ''): Route[] => {
  const newRoutes: Omit<Route, 'children'>[] = [];
  routes.forEach((route) => {
    const { children, ...r } = route;
    if (typeof r.path === 'string') {
      r.path = prefix + r.path;
    }
    newRoutes.push(r);

    if (children) {
      newRoutes.push(...getFlatRoutes(children, typeof r.path === 'string' ? r.path : prefix));
    }
  });

  return newRoutes;
};

export const getCurrent = (
  routes: Current['matchedRoute'][],
  currentPath: SifrrPath = window.location
): Current | undefined => {
  const matchedRoute = routes.find((r) => {
    return r.pathRegex.testRoute(currentPath.pathname).match;
  });
  if (!matchedRoute) return;

  const parsed = matchedRoute?.pathRegex.testRoute(currentPath.pathname).data;
  const q = new URLSearchParams(currentPath.search);
  const query: Record<string, string | string[] | null> = {};
  for (const k of q.keys()) {
    const v = q.getAll(k);
    query[k] = v.length > 1 ? v : (v[0] ?? null);
  }

  const title = matchedRoute.title ?? document.title;
  window.document.title = title;

  return {
    matchedRoute,
    title,
    path: currentPath.href,
    data: parsed,
    query,
    hash: currentPath.hash,
    meta: matchedRoute.meta
  };
};

const getClickEventListener =
  (routerStore: Router) =>
  (event: Event): void | false => {
    const e = event as PointerEvent | TouchEvent;
    if (!window.history?.pushState) return false;
    if (e.metaKey || e.ctrlKey) return false;

    // find closest link element
    const composedPath = e.composedPath ? e.composedPath() : [e.target],
      l = composedPath.length;
    let target: HTMLAnchorElement | undefined = undefined;
    for (let i = 0; i < l; i++) {
      const t = <HTMLElement>composedPath[i];
      if (t.tagName && t.tagName === 'A') {
        target = <HTMLAnchorElement>t;
        break;
      }
    }

    if (
      !target ||
      target.host !== window.location.host ||
      (target.target && target.target !== '_self')
    )
      return false;

    e.preventDefault();
    // replace title with First title if there's no attribute
    routerStore.value.push(target);
  };

export const createRouter = (options: Options) => {
  const flatRoutes = getFlatRoutes(options.routes).map((r) => ({
    ...r,
    pathRegex: new RegexPath(r.path)
  }));
  const befores = options.before ? [options.before] : [];
  const afters = options.after ? [options.after] : [];

  const push = (currentPath: SifrrPath = window.location, replace = false) => {
    befores.forEach((c) => {
      try {
        c();
      } catch (e) {
        console.error(e);
      }
    });
    const prev = router.value.current?.path;
    if (prev === currentPath.href) return;
    router.value.refresh(currentPath);
    const state = {
      pathname: currentPath.pathname,
      href: currentPath.href,
      title: '',
      routerContext: router.value.current
        ? JSON.parse(JSON.stringify(router.value.current?.data))
        : null
    };
    window.history[replace ? 'replaceState' : 'pushState'](state, '', currentPath.href);
    afters.forEach((c) => {
      try {
        c();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const router = store(STORE_NAME, {
    routes: flatRoutes,
    current: getCurrent(flatRoutes, window.location),
    refresh: (currentPath: SifrrPath) => {
      router.value.current = getCurrent(flatRoutes, currentPath);
    },
    push,
    replace: (currentPath?: SifrrPath) => {
      push(currentPath, true);
    },
    before: (c: () => void) => befores.push(c),
    after: (c: () => void) => afters.push(c)
  });

  window.document.addEventListener('click', getClickEventListener(router));

  window.addEventListener('popstate', (_e: PopStateEvent) => {
    router.value.replace();
  });

  return router;
};

export type Router = Readonly<ReturnType<typeof createRouter>>;
