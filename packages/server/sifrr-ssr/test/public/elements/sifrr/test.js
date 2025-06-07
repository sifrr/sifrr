class SifrrTest extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<style media="screen">
      p {
        color: blue;
      }
    </style>
    <p>Simple element</p>
    <p>${({ state }) => state.id}</p>`;
  }

  constructor() {
    super();
    this.state = { id: 1 };
  }
}

Sifrr.Dom.register(SifrrTest);
