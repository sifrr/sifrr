import { SifrrProps } from '@sifrr/template';
import { ISifrrElement, SifrrElementKlass } from './types';

// Caches
export const elements = Object.create(null);

// Register Custom Element Function
export function register(Element: SifrrElementKlass<any>, silent = false) {
  const name = Element.elementName;
  if (!name) {
    throw Error('Error creating Custom Element: No name given.');
  } else if (window.customElements.get(name)) {
    if (!silent)
      console.warn(
        `Error creating Element: ${name} - Custom Element with this name is already defined.`
      );
    return false;
  } else if (name.indexOf('-') < 1) {
    throw Error(`Error creating Element: ${name} - Custom Element name must have one hyphen '-'`);
  } else {
    Element.dependencies?.forEach((c) => register(c));
    window.customElements.define(name, Element);
    elements[name] = Element;
    return true;
  }
}

export function createElement<T, K extends ISifrrElement>(
  elementClass: SifrrElementKlass<K> | string,
  props: SifrrProps<T>,
  oldElement?: K
) {
  if (typeof elementClass === 'string') {
    if (oldElement?.tagName.toLowerCase() === elementClass) {
      oldElement.setProps?.(props);
      return oldElement;
    } else {
      const element = <ISifrrElement>document.createElement(elementClass);
      element.setProps?.(props);
      return element;
    }
  }

  register(elementClass);
  if (oldElement instanceof elementClass) {
    oldElement.setProps(props);
    return oldElement;
  } else {
    const element = <ISifrrElement>document.createElement(elementClass.elementName);
    element.setProps?.(props);
    return element;
  }
}
