class RouteData extends Sifrr.Dom.Element {
  static template = Sifrr.Dom.html`
    <p>${(el) => JSON.stringify(el.router.current.data, null, 2)}</p>
  `;

  onConnect() {
    console.log('route data connected');
  }

  setup() {
    this.router = window.router.value;
    return {};
  }
}

Sifrr.Dom.register(RouteData);

export default RouteData;
