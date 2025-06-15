class SifrrNosr extends Sifrr.Dom.Element {
  static template = Sifrr.Dom.html`<style media="screen">
    sifrr-nosr p {
      color: red;
    }
    </style>
    <p>No shadow root</p>
    <p>${(el) => el.context?.id}</p>`;

  constructor() {
    super({
      useShadowRoot: false
    });
  }

  setup() {
    return {
      id: 1
    };
  }
}

Sifrr.Dom.register(SifrrNosr);
