import {
  Element as SifrrElement,
  register,
  createElement,
  getStore,
  html,
  SifrrElementKlass
} from '@sifrr/dom';
import RegexPath from './regexpath';
import { Current, getCurrent, Router, STORE_NAME } from '@/router';
import { useRouter } from '@/helpers';

class SifrrRouter extends SifrrElement {
  constructor() {
    super({
      useShadowRoot: false
    });
  }

  static readonly template = html`<sifrr-fragment>
    ${async (el: SifrrRouter, oldVal: any) => {
      const router: Router = (el.context as any).router;
      const current = router.value.current;
      const comp = current?.matchedRoute.component;

      if (!comp) return null;

      const component = typeof comp === 'string' || 'template' in comp ? comp : await comp();

      return createElement(
        component,
        current.matchedRoute.getProps?.(current.data) as any,
        oldVal?.[0]
      );
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
  path?: string | RegExp;
  component?:
    | string
    | SifrrElementKlass<any>
    | (() => SifrrElementKlass<any> | Promise<SifrrElementKlass<any>>);
  getProps?: (data?: Current['data']) => unknown;

  constructor() {
    super({
      useShadowRoot: true
    });
  }

  static readonly template = html`<sifrr-fragment :if=${(el: SifrrRoute) => el.context.match.value}>
    ${async (el: SifrrRoute, oldVal: any) => {
      const current = (el.context as any).data;
      const comp = current?.matchedRoute.component;

      if (!comp) return null;

      const component = typeof comp === 'string' || 'template' in comp ? comp : await comp();

      return createElement(
        component,
        current.matchedRoute.getProps?.(current.data) as any,
        oldVal?.[0]
      );
    }}
    <slot />
  </sifrr-fragment>`;

  setup() {
    const router = getStore<Router>(STORE_NAME);
    if (!router) {
      throw Error('No router was registered before creating sifrr-route element.');
    }
    router.value.after(() => this.refresh());

    return {
      regex: this.path ? new RegexPath(this.path) : undefined,
      match: this.ref(false),
      data: undefined as Current | undefined
    };
  }

  onConnect(): void {
    this.refresh();
  }

  refresh() {
    const data = this.checkMatch();
    this.context.match.value = !!data;
    this.context.data = data;
  }

  checkMatch() {
    if (!this.context.regex) return undefined;
    const current = getCurrent([
      {
        path: this.path!,
        pathRegex: this.context.regex,
        component: this.component
      }
    ]);
    return current;
  }
}

register(SifrrRoute, false, 'sifrr-route');

export { RegexPath, SifrrRoute };
export { createRouter, type Route, type Options } from './router';
