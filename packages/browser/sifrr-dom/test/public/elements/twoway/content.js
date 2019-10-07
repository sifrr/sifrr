class TwowayContent extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<div>\${this.state.content}</div>
    <div :sifrr-html="true" id="html">\${this.state.content}</div>
    <div class="" contenteditable :sifrr-bind="content">
      \${this.state.content}
    </div>
     <!-- Remove \\$\{this.state.content} from contenteditable if you don't want to display html in contenteditable -->`;
  }
}
TwowayContent.defaultState = { content: 'content' };
Sifrr.Dom.register(TwowayContent);
