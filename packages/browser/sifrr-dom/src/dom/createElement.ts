import { SifrrProps } from '@sifrr/template';
import { ISifrrElement, SifrrElement } from './types';

export default function createElement<T>(
  elementClass: typeof SifrrElement,
  props: SifrrProps<T>,
  oldElement: ISifrrElement
) {
  if (oldElement instanceof elementClass) {
    oldElement.setProps(props);
    return oldElement;
  } else {
    const element = <ISifrrElement>document.createElement(elementClass.elementName);
    element.setProps(props);
    return element;
  }
}
