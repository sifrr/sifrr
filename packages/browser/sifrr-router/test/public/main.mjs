const options = {
  routes: [
    {
      path: '/test',
      title: 'Testing',
      component: async () => (await import('./test.mjs')).default
    },
    {
      path: '/route-data/**',
      title: 'Route data check',
      component: async () => (await import('./route-data.mjs')).default
    },
    {
      path: /^\/regex\/(\w+)\/(?<group>\w+)\/(.*)$/,
      title: 'Route data check with regex',
      component: async () => (await import('./route-data.mjs')).default
    },
    {
      path: '/:first/*/**/mnop/*/:last',
      title: 'Route data check complex',
      component: async () => (await import('./route-data.mjs')).default
    }
  ]
};

const router = (window.router = Sifrr.Router.createRouter(options));

class MainElement extends Sifrr.Dom.Element {
  static template = Sifrr.Dom.html`
    <button :@click=${() => router.value.push(new URL('test?banger=ok', location.origin))}>Push</button>
    <button :@click=${() => router.value.replace(new URL('test?banger=replace', location.origin))}>Replace</button>
    <sifrr-router></sifrr-router>
    <h3>Sifrr-routes</h3>
    <sifrr-route id="test" ::path="/">
      <p>a</p>
      <p>Home</p>
      <p>e</p>
    </sifrr-route>
    <sifrr-route id="everywhere" ::path="/**">
      <p>Visible everywhere</p>
    </sifrr-route>
    <sifrr-route id="abcd" title="abcd" ::path="/test">
      <p>/test</p>
    </sifrr-route>
    <sifrr-route id="complex" :path="/:x/*/**/mnop/*/:k">
      Route state check
    </sifrr-route>
    <sifrr-route :title=${() => 'create with string'} :path="/route/test" :component="test-element" ::get-props=${(
      data
    ) => {
      return { query: data.query, hash: data.hash };
    }}></sifrr-route>
    <sifrr-route title="dynamic" :path="/route/dynamic" ::component=${async () => (await import('./dynamic.mjs')).default}></sifrr-route>
    </sifrr-route>
  `;
}
Sifrr.Dom.register(MainElement);
