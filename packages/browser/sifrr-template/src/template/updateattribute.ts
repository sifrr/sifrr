// Attribute related gotchas
export default (element: HTMLElement, name: string, newValue: string | false | null) => {
  if (newValue === false || newValue === null || newValue === undefined)
    element.hasAttribute(name) && element.removeAttribute(name);
  else if (name === 'class') element.className = newValue;
  else if (name === 'id' && element[name] !== newValue) element[name] = newValue;
  else if (name === 'value' && name in element && element[name] !== newValue)
    element[name] = newValue;
  else if (element.getAttribute(name) !== newValue) {
    element.setAttribute(name, newValue);
  }
};
