export default class Store<T> {
  public value: T;
  private listeners: ((store: this) => void)[] = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  update(newValue: T) {
    this.value = newValue;
    this.onUpdate();
  }

  addListener(fxn: (store: this) => void) {
    this.listeners.push(fxn);
  }

  private onUpdate() {
    this.listeners.forEach(listener => listener(this));
  }
}
