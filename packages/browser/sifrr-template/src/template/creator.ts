import {
  TEXT_NODE,
  COMMENT_NODE,
  ELEMENT_NODE,
  REF_REG,
  REF_REG_EXACT,
  REF_REG_GLOBAL,
  REF_LENGTH
} from './constants';
import updateAttribute from './updateattribute';

import { SifrrBindType, SifrrBindMap, SifrrFunctionMap } from './types';

function attrToProp(attrName: string) {
  return attrName.substring(1).replace(/-([a-z])/g, (g) => g[1]!.toUpperCase());
}

function getAllMatches(regex: RegExp, str: string) {
  const result = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[0]);
    if (!regex.global) break; // Avoid infinite loop if global flag is missing
  }
  return result;
}

const creator = <T>(el: Node, functionMap: SifrrFunctionMap<T>): SifrrBindMap<T>[] | 0 => {
  // TEXT/COMMENT Node
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    const textEl = <Text>el;
    const x = textEl.data;
    const xTrim = textEl.data.trim();
    const exactMatch = REF_REG_EXACT.exec(xTrim);
    if (exactMatch) {
      textEl.data = '';

      return [
        {
          type: SifrrBindType.Text,
          value: functionMap.get(exactMatch[1]!)
        }
      ];
    }

    const middleMatch = REF_REG.exec(x);
    if (middleMatch) {
      if (textEl.nodeType === COMMENT_NODE) {
        console.error('Bindings in middle of comments are not supported and will be ignored.');
        return 0;
      }
      if (middleMatch.index === 0) {
        textEl.splitText(REF_LENGTH);
        textEl.data = '';

        return [
          {
            type: SifrrBindType.Text,
            value: functionMap.get(middleMatch[1]!)
          }
        ];
      } else {
        textEl.splitText(middleMatch.index);
      }
    }

    return 0;
  }

  // ELEMENT Node
  if (el.nodeType === ELEMENT_NODE) {
    const eln = <HTMLElement>el;
    const bm: SifrrBindMap<T>[] = [];
    // attributes
    const attrs = Array.prototype.slice.call(eln.attributes),
      l = attrs.length;

    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      const exactMatch = attribute.value.match(REF_REG_EXACT);
      const middleMatch = attribute.value.match(REF_REG);

      if (!exactMatch && !middleMatch) continue;

      if (!exactMatch && middleMatch) {
        updateAttribute(
          eln,
          attribute.name,
          attribute.value.replace(REF_REG_GLOBAL, '${__bindingFunction__}')
        );
        console.error(
          `Binding in between text is not supported in Attribute or Prop. Error in attribute '${attribute.name}' of element:`
        );
        console.log(el);

        continue;
      }

      if (attribute.name[0] === ':' && attribute.name[1] === ':') {
        bm.push({
          type: SifrrBindType.DirectProp,
          name: attrToProp(attribute.name).substring(1),
          value: functionMap.get(middleMatch[1])
        });
      } else if (attribute.name[0] === ':') {
        bm.push({
          type: SifrrBindType.Prop,
          name: attrToProp(attribute.name),
          value: functionMap.get(middleMatch[1])
        });
      } else {
        bm.push({
          type: SifrrBindType.Attribute,
          name: attribute.name,
          value: functionMap.get(middleMatch[1])
        });
      }

      updateAttribute(eln, attribute.name, '');
    }
    if (bm.length > 0) return bm;
  }
  return 0;
};

export default creator;
