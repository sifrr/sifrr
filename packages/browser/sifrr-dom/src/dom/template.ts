import { TEMPLATE } from './constants';

export default (
  str: TemplateStringsArray | string | HTMLTemplateElement | HTMLElement | NodeList | Node[],
  ...extra: any[]
) => {
  if (str instanceof window.HTMLTemplateElement) return str;
  let newstr: string;
  const tmp = TEMPLATE();
  if (typeof str === 'string') {
    if (typeof extra[0] === 'string') newstr = `<style>${extra.join('')}</style>${str}`;
    else newstr = str;
  } else if (str instanceof window.Node) {
    tmp.content.appendChild(str);
  } else if (
    str instanceof window.NodeList ||
    (Array.isArray(str) && str[0] instanceof window.Node)
  ) {
    Array.from(str).forEach(s => {
      tmp.content.appendChild(s);
    });
  } else if ('raw' in str) {
    newstr = String.raw(str, ...extra);
  } else {
    throw Error('Argument must be of type string | template literal | Node | [Node] | NodeList');
  }
  if (newstr) tmp.innerHTML = newstr.replace(/(\\)?\$(\\)?\{/g, '${');
  return tmp;
};
