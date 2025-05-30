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
import { add } from '@/template/event';

function attrToProp(attrName: string) {
  return attrName.substring(1).replace(/-([a-z])/g, (g) => g[1]!.toUpperCase());
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
    const attrs: Attr[] = Array.prototype.slice.call(eln.attributes),
      l = attrs.length;

    for (let i = 0; i < l; i++) {
      const attribute = attrs[i]!;
      const exactMatch = REF_REG_EXACT.exec(attribute.value);
      const middleMatch = REF_REG.exec(attribute.value);

      if (middleMatch && !exactMatch) {
        updateAttribute(
          eln,
          attribute.name,
          attribute.value.replace(REF_REG_GLOBAL, '${__bindingFunction__}')
        );
        console.error(
          `Binding in between text is not supported in Attribute or Prop. Error in attribute '${attribute.name}' of element:`,
          el
        );

        continue;
      }
      if (!exactMatch) continue;

      const value = functionMap.get(exactMatch[1]!);

      if (attribute.name[0] === ':' && (attribute.name[1] === ':' || attribute.name[1] === '@')) {
        if (attribute.name[1] === '@') {
          add(attribute.name.substring(2));
        }
        bm.push({
          type: SifrrBindType.DirectProp,
          name:
            attribute.name[1] === '@'
              ? attribute.name.substring(1).toLowerCase()
              : attrToProp(attribute.name).substring(1),
          value
        });
      } else if (attribute.name === ':if') {
        bm.unshift({
          type: SifrrBindType.If,
          value
        });
      } else if (attribute.name[0] === ':' || attribute.name[0] === '@') {
        if (attribute.name[0] === '@') {
          add(attribute.name.substring(1));
        }
        bm.push({
          type: SifrrBindType.Prop,
          name:
            attribute.name[0] === '@' ? attribute.name.toLowerCase() : attrToProp(attribute.name),
          value
        });
      } else {
        bm.push({
          type: SifrrBindType.Attribute,
          name: attribute.name,
          value
        });
      }

      eln.removeAttribute(attribute.name);
    }
    if (bm.length > 0) return bm;
  }
  return 0;
};

export default creator;
