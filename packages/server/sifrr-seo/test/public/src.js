import '@webcomponents/shadycss';
import '@webcomponents/shadydom';
import SifrrDom from '@sifrr/dom';

window.Sifrr.Dom = SifrrDom;
Sifrr.Dom.setup({
  useShadowRoot: true
});
Sifrr.Dom.load('sifrr-test');
Sifrr.Dom.load('sifrr-nosr');
