export default (name: string, extended: string) => {
  return `import { html, css } from '@sifrr/template';
import { Element, register } from '@sifrr/dom';

const CSS = css\`\`;
const Template = html\`
  \${CSS}
\`;

class ${name} extends Element${extended ? `.extends(${extended})` : ''} {
  static get template() {
    return Template;
  }

  onConnect() {}

  onDisconnect() {}
}
register(${name}${extended ? ", { extends: '/* html-tag-of-element-you-want-to-extend */' }" : ''});

export default ${name};
`;
};
