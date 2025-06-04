import RegexPath from '@/regexpath';
import { SifrrElementKlass, store } from '@sifrr/dom';

export const STORE_NAME = 'sifrr-router';

export type SifrrPath = Pick<Location, 'pathname' | 'hash' | 'search' | 'href'>;

export type Current = {
  matchedRoute: Omit<Route, 'children'> & {
    pathRegex: RegexPath;
  };
  path: string;
  data: ReturnType<typeof RegexPath.prototype.testRoute>['data'];
  query: Record<string, string | string[] | null>;
  hash: string;
};

export type Route = {
  path: string | RegExp;
  title: string;
  component:
    | SifrrElementKlass<any>
    | (() => SifrrElementKlass<any> | Promise<SifrrElementKlass<any>>);
  meta: Record<string, unknown>;
  getProps?: (data?: Current['data']) => unknown;
  children?: Route[];
};

export type Options = {
  routes: Route[];
  before?: () => {};
  after?: () => {};
};

export const getFlatRoutes = (routes: Route[], prefix = '') => {
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

const getCurrent = (
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

  return {
    matchedRoute,
    path: currentPath.href,
    data: parsed,
    query,
    hash: currentPath.hash
  };
};

const getClickEventListener = (routerStore: Router) => (event: Event) => {
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

  const push = (currentPath: SifrrPath, replace = false) => {
    options.before?.();
    const prev = router.value.current?.path;
    if (prev === currentPath.href) return;
    router.value.refresh(currentPath);
    const title = router.value.current?.matchedRoute.title ?? document.title;
    const state = {
      pathname: currentPath.pathname,
      href: currentPath.href,
      title: title,
      routerContext: router.value.current
        ? JSON.parse(JSON.stringify(router.value.current?.data))
        : null
    };
    window.document.title = title;
    window.history[replace ? 'replaceState' : 'pushState'](state, title, currentPath.href);
    options.after?.();
  };

  const router = store(STORE_NAME, {
    routes: flatRoutes,
    current: getCurrent(flatRoutes),
    refresh: (currentPath?: SifrrPath) => {
      router.value.current = getCurrent(flatRoutes, currentPath);
    },
    push,
    replace: (currentPath: SifrrPath, replace = false) => {
      push(currentPath, true);
    }
  });

  window.document.addEventListener('click', getClickEventListener(router));

  window.addEventListener('popstate', (e: PopStateEvent) => {
    if (e.state?.title) document.title = e.state.title;
    router.value.refresh();
  });

  return router;
};

export type Router = Readonly<ReturnType<typeof createRouter>>;
