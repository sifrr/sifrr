class TestElement extends Sifrr.Dom.Element {
  static template = Sifrr.Dom.html`
    <p>test element</p>
    <p>${(el) => {
      return JSON.stringify({ query: el.context.router.current?.query ?? el.query }, null, 2);
    }}</p>
    <p>${(el) => JSON.stringify({ hash: el.context.router.current?.hash ?? el.hash }, null, 2)}</p>
  `;

  onConnect() {
    console.log('test el connected');
  }

  setup() {
    this.router = window.router.value;
    return {
      router: window.router.value
    };
  }
}

Sifrr.Dom.register(TestElement);

export default TestElement;
