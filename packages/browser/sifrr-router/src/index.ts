import { Element as SifrrElement, register, createElement, getStore, html } from '@sifrr/dom';
import RegexPath from './regexpath';
import { Router, STORE_NAME } from '@/router';
import { useRouter } from '@/helpers';

class SifrrRouter extends SifrrElement {
  constructor() {
    super({
      useShadowRoot: false
    });
  }

  static readonly template = html`${async (el: SifrrRouter, oldVal: any) => {
    const router: Router = (el.context as any).router;
    const current = router.value.current;
    if (!current) return null;

    const comp = current.matchedRoute.component;
    const component = 'template' in comp ? comp : await comp();

    return createElement(
      component,
      current.matchedRoute.getProps?.(current.data) as any,
      oldVal?.[0]
    );
  }}`;

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
  constructor() {
    super({
      useShadowRoot: false
    });
  }

  static readonly template = html`${async (el: SifrrRoute, oldVal: any) => {
    const router = (el.context as any).router;
    const current = router.value.current;
    if (!current) return null;

    const comp = current.matchedRoute.component;
    const component = 'template' in comp ? comp : await comp();

    return createElement(
      component,
      current.matchedRoute.getProps?.(current.data) as any,
      oldVal?.[0]
    );
  }}`;

  setup() {
    const router = getStore<Router>(STORE_NAME);
    if (!router) {
      throw Error('No router was registered before creating sifrr-route element.');
    }
    this.watchStore(router);

    return {
      router
    };
  }
}

register(SifrrRoute, false, 'sifrr-route');

export { RegexPath, SifrrRoute };
export { createRouter, type Route, type Options } from './router';
