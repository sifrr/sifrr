class SifrrTest extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.html`<style media="screen">
      p {
        color: blue;
      }
    </style>
    <p>Simple element</p>
    <p>${({ context }) => context.id}</p>`;
  }

  setup() {
    return {
      id: 2
    };
  }
}

Sifrr.Dom.register(SifrrTest);
