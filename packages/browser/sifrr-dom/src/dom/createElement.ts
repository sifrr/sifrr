import { SifrrProps } from '@sifrr/template';
import { ISifrrElement, SifrrElementKlass } from './types';

// Caches
export const elements = Object.create(null);

// Register Custom Element Function
export function register(
  Element: SifrrElementKlass<any>,
  silent = false,
  name = Element.elementName
) {
  if (!name) {
    throw Error('Error creating Custom Element: No name given.');
  } else if (window.customElements.get(name)) {
    if (!silent)
      console.warn(
        `Error creating Element: ${name} - Custom Element with this name is already defined.`,
        Element
      );
    return false;
  } else if (name.indexOf('-') < 1) {
    console.error(Element);
    throw Error(`Error creating Element: ${name} - Custom Element name must have one hyphen '-'`);
  } else {
    Element.dependencies?.forEach((c) => register(c));
    window.customElements.define(name, Element);
    elements[name] = Element;
    return true;
  }
}

export function createElement<T>(
  elementClass: SifrrElementKlass<any> | string,
  props: SifrrProps<T>,
  oldElement?: ISifrrElement | HTMLElement
) {
  if (typeof elementClass === 'string') {
    if (oldElement?.tagName?.toLowerCase() === elementClass) {
      (oldElement as ISifrrElement).setProps?.(props);
      return oldElement;
    } else {
      const element = <ISifrrElement>document.createElement(elementClass);
      element.setProps?.(props);
      return element;
    }
  }

  register(elementClass, true);
  if (oldElement instanceof elementClass) {
    (oldElement as ISifrrElement).setProps(props);
    return oldElement!;
  } else {
    const element = <ISifrrElement>document.createElement(elementClass.elementName);
    element.setProps?.(props);
    return element;
  }
}
