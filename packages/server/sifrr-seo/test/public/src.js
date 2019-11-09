import '@webcomponents/shadycss';
import '@webcomponents/shadydom';

window.Sifrr.Dom.setup({
  useShadowRoot: true
});
window.Sifrr.Dom.load('sifrr-test');
window.Sifrr.Dom.load('sifrr-nosr');
