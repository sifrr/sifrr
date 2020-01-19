import { SifrrProps } from '@sifrr/template';
import { ISifrrElement, SifrrElement } from './types';

export default function createElement<T>(
  elementClass: typeof SifrrElement | string,
  props: SifrrProps<T>,
  oldElement: ISifrrElement
) {
  if (typeof elementClass === 'string') {
    if (oldElement.tagName.toLowerCase() === elementClass) {
      oldElement.setProps(props);
      return oldElement;
    } else {
      const element = <ISifrrElement>document.createElement(elementClass);
      element.setProps(props);
      return element;
    }
  }

  if (oldElement instanceof elementClass) {
    oldElement.setProps(props);
    return oldElement;
  } else {
    const element = <ISifrrElement>document.createElement(elementClass.elementName);
    element.setProps(props);
    return element;
  }
}
