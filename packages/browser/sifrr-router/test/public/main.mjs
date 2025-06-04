const options = {
  routes: [
    {
      path: '/test',
      component: async () => (await import('./test.mjs')).default
    },
    {
      path: '/route-data/**',
      component: async () => (await import('./route-data.mjs')).default
    },
    {
      path: /^\/regex\/(\w+)\/(?<group>\w+)\/(.*)$/,
      component: async () => (await import('./route-data.mjs')).default
    },
    {
      path: '/:x/*/**/mnop/*/:k',
      component: async () => (await import('./route-data.mjs')).default
    }
  ]
};

const router = (window.router = Sifrr.Router.createRouter(options));

class MainElement extends Sifrr.Dom.Element {
  static template = Sifrr.Dom.html`
    <button :@click=${() => router.value.push(new URL('test?banger=ok', location.origin))}>Push</button>
    <button :@click=${() => router.value.replace(new URL('test?banger=replace', location.origin))}>Replace</button>
    <sifrr-router />
  `;
}
Sifrr.Dom.register(MainElement);
