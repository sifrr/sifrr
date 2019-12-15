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

import { SifrrBindType, SifrrBindCreatorFxn, SifrrBindMap } from './types';

function attrToProp(attrName: string) {
  return attrName.substr(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
}

const creator: SifrrBindCreatorFxn = (el, functionMap) => {
  // TEXT/COMMENT Node
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    const textEl = <Text>(<unknown>el);
    const x = textEl.data;
    const exactMatch = x.match(REF_REG_EXACT);
    if (exactMatch) {
      textEl.data = '';

      return [
        {
          type: SifrrBindType.Text,
          value: functionMap.get(exactMatch[1])
        }
      ];
    }

    const middleMatch = x.match(REF_REG);
    if (middleMatch) {
      if (middleMatch.index === 0) {
        textEl.splitText(REF_LENGTH);
        textEl.data = '';

        return [
          {
            type: SifrrBindType.Text,
            value: functionMap.get(middleMatch[1])
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
    const bm: SifrrBindMap[] = [];
    // attributes
    const attrs = Array.prototype.slice.call(el.attributes),
      l = attrs.length;

    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      const exactMatch = attribute.value.match(REF_REG_EXACT);
      const middleMatch = attribute.value.match(REF_REG);

      if (!exactMatch && !middleMatch) continue;

      if (!exactMatch && middleMatch) {
        updateAttribute(
          el,
          attribute.name,
          attribute.value.replace(REF_REG_GLOBAL, '${__bindingFunction__}')
        );
        console.error(
          `Binding in between text is not supported in Attribute or Prop. Error in attribute '${attribute.name}' of element:`
        );
        console.log(el);

        continue;
      }

      if (attribute.name[0] === ':') {
        bm.push({
          type: SifrrBindType.Prop,
          name: attrToProp(attribute.name),
          value: functionMap.get(middleMatch[1]),
          direct: false
        });
      } else if (attribute.name[0] === '_') {
        bm.push({
          type: SifrrBindType.Prop,
          name: attribute.name,
          value: functionMap.get(middleMatch[1]),
          direct: true
        });
      } else {
        bm.push({
          type: SifrrBindType.Attribute,
          name: attribute.name,
          value: functionMap.get(middleMatch[1])
        });
      }

      updateAttribute(el, attribute.name, '');
    }
    if (bm.length > 0) return bm;
  }
  return 0;
};

export default creator;
