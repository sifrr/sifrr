class TestElement extends Sifrr.Dom.Element {
  static template = Sifrr.Dom.html`
    <p>test element</p>
    <p>${(el) => {
      return JSON.stringify({ query: el.router.current.query }, null, 2);
    }}</p>
    <p>${(el) => JSON.stringify({ hash: el.router.current.hash }, null, 2)}</p>
  `;

  onConnect() {
    console.log('test el connected');
  }

  setup() {
    this.router = window.router.value;
    return {};
  }
}

Sifrr.Dom.register(TestElement);

export default TestElement;
