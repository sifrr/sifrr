import { Element as SifrrElement, register, createElement, getStore, html } from '@sifrr/dom';
import RegexPath from './regexpath';
import { Current, getCurrent, Route, Router, STORE_NAME } from '@/router';
import { useRouter } from '@/helpers';

const createAsync = (current?: Current, oldElement?: any) => {
  const comp = current?.matchedRoute.component;
  if (!comp) return null;
  if (typeof comp === 'string' || 'template' in comp) {
    return createElement(comp, current.matchedRoute.getProps?.(current) as any, oldElement);
  } else {
    return Promise.resolve(comp()).then((component) =>
      createElement(component, current.matchedRoute.getProps?.(current) as any, oldElement)
    );
  }
};

class SifrrRouter extends SifrrElement {
  declare context: ReturnType<typeof this.setup>;
  constructor() {
    super({
      useShadowRoot: false
    });
  }

  static readonly template = html`<sifrr-fragment>
    ${async (el: SifrrRouter, oldVal: any) => {
      const router: Router = el.context.router;
      const current = router.value.current;
      return createAsync(current, oldVal?.[0]);
    }}
  </sifrr-fragment>`;

  setup() {
    const router = useRouter();
    if (!router) {
      throw Error('No router was registered before creating sifrr-route element.');
    }
    this.watchStore(router);

    return {
      router
    };
  }
}

register(SifrrRouter, false, 'sifrr-router');

class SifrrRoute extends SifrrElement {
  declare context: ReturnType<typeof this.setup>;
  path?: Route['path'];
  component?: Route['component'];
  getProps?: Route['getProps'];

  constructor() {
    super({
      useShadowRoot: true
    });
  }

  static readonly template = html`<sifrr-fragment :if=${(el: SifrrRoute) => el.context.match.value}>
      ${(el: SifrrRoute, oldVal: any) => {
        const current = el.context.data;
        return createAsync(current, oldVal?.[0]);
      }}
    </sifrr-fragment>
    <slot :if=${(el: SifrrRoute) => el.context.match.value} /> `;

  setup() {
    const router = getStore<Router>(STORE_NAME);
    if (!router) {
      throw Error('No router was registered before creating sifrr-route element.');
    }
    router.value.after(() => this.refresh());

    return {
      component: this.component,
      regex: this.path ? new RegexPath(this.path) : undefined,
      match: this.ref(false),
      data: undefined as Current | undefined,
      getProps: this.getProps
    };
  }

  onConnect(): void {
    this.refresh();
  }

  refresh() {
    const data = this.checkMatch();
    this.context.data = data;
    this.context.match.value = !!data;
  }

  checkMatch() {
    if (!this.context.regex) return undefined;
    const current = getCurrent([
      {
        path: this.path!,
        pathRegex: this.context.regex,
        component: this.context.component,
        getProps: this.context.getProps
      }
    ]);
    return current;
  }
}

register(SifrrRoute, false, 'sifrr-route');

export { RegexPath, SifrrRoute };
export { createRouter, type Route, type Options } from './router';
