class SifrrNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<style media="screen">
    sifrr-nosr p {
      color: red;
    }
    </style>
    <p>No shadow root</p>
    <p>${({ state }) => state.id}</p>`;
  }

  static get useShadowRoot() {
    return false;
  }

  constructor() {
    super();
    this.state = { id: 2 };
  }
}

Sifrr.Dom.register(SifrrNosr);
