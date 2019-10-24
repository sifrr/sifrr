import shouldMerge from '../utils/shouldmerge';
const objCon = {}.constructor;

export class Store {
  constructor(initial) {
    this.value = initial;
    this.listeners = [];
    this.addListener = this.listeners.push.bind(this.listeners);
  }

  set(newValue) {
    if (shouldMerge(this.value, newValue)) {
      if (this.value.constructor === objCon) Object.assign(this.value, newValue);
      else this.value = newValue;
    }
    this.listeners.forEach(l => l());
  }
}

export function bindStoresToElement(element, stores = []) {
  const update = element.update.bind(element);
  if (Array.isArray(stores)) stores.forEach(s => s.addListener(update));
  else stores.addListener(update);
}
