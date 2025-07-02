declare global {
  interface Element {
    $: typeof Element.prototype.querySelector;
    $$: typeof Element.prototype.querySelectorAll;
  }

  interface Document {
    $: typeof Document.prototype.querySelector;
    $$: typeof Document.prototype.querySelectorAll;
  }
}

function moveEl(arr: any[], oldPosition: number, newPosition: number) {
  [arr[oldPosition], arr[newPosition]] = [arr[newPosition], arr[oldPosition]];
}

function shuffle(array: any[], percent: number = 50) {
  let currentIndex = array.length;

  while (currentIndex > (array.length * (100 - percent)) / 100) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    moveEl(array, currentIndex, randomIndex);
  }
}

function rearrange(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  shuffle(data);
  setData(data);
  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function rearrange2(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  shuffle(data, 100);
  setData(data);
  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function swapback(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  moveEl(data, 645, 25);
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function swapforward(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  moveEl(data, 78, 896);
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function swapForwardBackward(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  moveEl(data, 2, 5);
  moveEl(data, 6, 2);
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function swapForwardBackwardMultiple(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  moveEl(data, 245, 867);
  moveEl(data, 868, 245);
  moveEl(data, 456, 678);
  moveEl(data, 679, 456);
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function shrink(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  data.splice(9, 89);
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 911;
}

function add(
  div: { data: any[] },
  setData: (data: any[]) => void,
  buildData: (n: number) => any[]
) {
  const data = div.data;
  data.splice(789, 0, ...buildData(45));
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1045;
}

function replace(
  div: { data: any[] },
  setData: (data: any[]) => void,
  buildData: (n: number) => any[]
) {
  const data = div.data;
  data.splice(789, 45, ...buildData(45));
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function updateAll(
  div: { data: any[] },
  setData: (data: any[]) => void,
  buildData: (n: number, from: number) => any[]
) {
  const data = div.data;
  data.splice(0, 1000, ...buildData(1000, 1));
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1000;
}

function replaceAndAdd(
  div: { data: any[] },
  setData: (data: any[]) => void,
  buildData: (n: number) => any[]
) {
  const data = div.data;
  data.splice(789, 50, ...buildData(100));
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 1050;
}

function replaceAndRemove(
  div: { data: any[] },
  setData: (data: any[]) => void,
  buildData: (n: number) => any[]
) {
  const data = div.data;
  data.splice(789, 100, ...buildData(50));
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 950;
}

function addInFront(
  div: { data: any[] },
  setData: (data: any[]) => void,
  buildData: (n: number) => any[]
) {
  const data = div.data;
  setData(buildData(45).concat(data));

  return document.body.$('#main-element')?.$$('tr').length === 1045;
}

function addInBack(
  div: { data: any[] },
  setData: (data: any[]) => void,
  buildData: (n: number) => any[]
) {
  const data = div.data;
  setData(data.concat(buildData(45)));

  return document.body.$('#main-element')?.$$('tr').length === 1045;
}

function removeInFront(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  data.splice(0, 50);
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 950;
}

function removeInBack(div: { data: any[] }, setData: (data: any[]) => void) {
  const data = div.data;
  data.splice(950, 50);
  setData(data);

  return document.body.$('#main-element')?.$$('tr').length === 950;
}

export {
  addInFront,
  addInBack,
  removeInFront,
  removeInBack,
  swapback,
  swapforward,
  swapForwardBackward,
  swapForwardBackwardMultiple,
  shrink,
  add,
  replace,
  updateAll,
  replaceAndAdd,
  replaceAndRemove,
  rearrange,
  rearrange2
};
