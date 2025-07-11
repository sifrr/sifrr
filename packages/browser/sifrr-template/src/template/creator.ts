import {
  TEXT_NODE,
  COMMENT_NODE,
  ELEMENT_NODE,
  REF_REG,
  REF_REG_EXACT,
  REF_REG_GLOBAL
} from './constants';

import { SifrrBindType, SifrrBindMap, SifrrFunctionMap, BindingFxn } from './types';
import { add } from '@/template/event';

function attrToProp(attrName: string) {
  return attrName.substring(1).replace(/-([a-z])/g, (g) => g[1]!.toUpperCase());
}

const emptyFxn = () => '';

const creator = <T>(el: Node, functionMap: SifrrFunctionMap<T>): SifrrBindMap<T>[] | 0 => {
  const getValueFxn = (content: string) => {
    const fxnMapVal = functionMap.get(content);
    if (typeof fxnMapVal === 'function') {
      return fxnMapVal;
    }
    if (fxnMapVal === undefined) {
      return new Function('me', `return ${content}`);
    }
    return () => fxnMapVal;
  };

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
          value: getValueFxn(exactMatch[1]!)
        }
      ];
    }

    const middleMatch = REF_REG.exec(x);
    if (middleMatch) {
      if (textEl.nodeType === COMMENT_NODE) {
        console.warn('Bindings in middle of comments are not supported and will be ignored.');
        return 0;
      }
      if (middleMatch.index === 0) {
        textEl.splitText(middleMatch[0].length);
        textEl.data = '';

        return [
          {
            type: SifrrBindType.Text,
            value: getValueFxn(middleMatch[1]!)
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
      let value: BindingFxn<T, any, any>,
        direct = false;
      if (exactMatch) {
        value = getValueFxn(exactMatch[1]!);
      } else {
        let middleMatch = REF_REG_GLOBAL.exec(attribute.value);
        if (!middleMatch) {
          value = emptyFxn;
          direct = true;
        } else {
          const text: (string | BindingFxn<T, any, any>)[] = [];
          let prev = 0;
          while (middleMatch) {
            text.push(attribute.value.substring(prev, middleMatch.index));
            text.push(getValueFxn(middleMatch[1]!));
            prev = middleMatch.index + middleMatch[0].length;
            middleMatch = REF_REG_GLOBAL.exec(attribute.value);
          }
          text.push(attribute.value.substring(prev));
          value = (p, o) => text.map((t) => (typeof t === 'function' ? t(p, o) : t)).join('');
        }
      }

      let remove = true;
      if (attribute.name[0] === ':' && (attribute.name[1] === ':' || attribute.name[1] === '@')) {
        if (attribute.name[1] === '@') {
          add(attribute.name.substring(2));
        }
        const name =
          attribute.name[1] === '@'
            ? attribute.name.substring(1).toLowerCase()
            : attrToProp(attribute.name).substring(1);
        bm.push({
          type: SifrrBindType.DirectProp,
          name,
          value: direct ? attribute.value : value
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
        const name =
          attribute.name[0] === '@' ? attribute.name.toLowerCase() : attrToProp(attribute.name);
        bm.push(
          direct
            ? {
                type: SifrrBindType.DirectProp,
                name,
                value: attribute.value
              }
            : {
                type: SifrrBindType.Prop,
                name,
                value
              }
        );
      } else {
        if (!direct) {
          bm.push({
            type: SifrrBindType.Attribute,
            name: attribute.name,
            value
          });
        }

        remove = false;
      }

      if (remove) eln.removeAttribute(attribute.name);
    }
    if (bm.length > 0) return bm;
  }
  return 0;
};

export default creator;
