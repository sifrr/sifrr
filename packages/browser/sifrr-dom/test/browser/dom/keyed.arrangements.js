function rearrange() {
  function moveEl(arr, oldPosition, newPosition) {
    return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
  }
  const data = document.body.$('main-element').state.data;
  moveEl(data, 23, 879);
  moveEl(data, 1, 7);
  moveEl(data, 12, 4);
  moveEl(data, 13, 8);
  data.splice(67, 4, { id: 7893, label: 'hahahaha' }, { id: 9475, label: 'sdghhgdfj' });
  data.splice(845, 4, { id: 7899, label: 'sadsfsdfsd' }, { id: 3456, label: 'asdaf dgfdg sh h' });
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 996;
}

function rearrange2() {
  function moveEl(arr, oldPosition, newPosition) {
    return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
  }
  const data = document.body.$('main-element').state.data;
  moveEl(data, 23, 879);
  moveEl(data, 108, 745);
  data.splice(675, 4, { id: 7893, label: 'hahahaha' }, { id: 9475, label: 'sdghhgdfj' });
  data.splice(745, 4, { id: 7899, label: 'sadsfsdfsd' }, { id: 3456, label: 'asdaf dgfdg sh h' });
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 996;
}

function swapback() {
  function moveEl(arr, oldPosition, newPosition) {
    return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
  }
  const data = document.body.$('main-element').state.data;
  moveEl(data, 645, 25);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1000;
}

function swapforward() {
  function moveEl(arr, oldPosition, newPosition) {
    return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
  }
  const data = document.body.$('main-element').state.data;
  moveEl(data, 78, 896);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1000;
}

function swapForwardBackward() {
  function moveEl(arr, oldPosition, newPosition) {
    return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
  }
  const data = document.body.$('main-element').state.data;
  moveEl(data, 2, 5);
  moveEl(data, 6, 2);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1000;
}

function swapForwardBackwardMultiple() {
  function moveEl(arr, oldPosition, newPosition) {
    return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
  }
  const data = document.body.$('main-element').state.data;
  moveEl(data, 245, 867);
  moveEl(data, 868, 245);
  moveEl(data, 456, 678);
  moveEl(data, 679, 456);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1000;
}

function shrink() {
  const data = document.body.$('main-element').state.data;
  data.splice(789, 89);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 911;
}

function add() {
  const data = document.body.$('main-element').state.data;
  data.splice(789, 0, ...window.buildData(45));
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1045;
}

function replace() {
  const data = document.body.$('main-element').state.data;
  data.splice(789, 45, ...window.buildData(45));
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1000;
}

function updateAll() {
  const data = document.body.$('main-element').state.data;
  data.splice(0, 1000, ...window.buildData(1000, 1));
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1000;
}

function replaceAndAdd() {
  const data = document.body.$('main-element').state.data;
  data.splice(789, 50, ...window.buildData(100));
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1050;
}

function replaceAndRemove() {
  const data = document.body.$('main-element').state.data;
  data.splice(789, 100, ...window.buildData(50));
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 950;
}

function addInFront() {
  const data = document.body.$('main-element').state.data;
  document.body.$('main-element').state.data = window.buildData(45).concat(data);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1045;
}

function addInBack() {
  const data = document.body.$('main-element').state.data;
  document.body.$('main-element').state.data = data.concat(window.buildData(45));
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 1045;
}

function removeInFront() {
  const data = document.body.$('main-element').state.data;
  data.splice(0, 50);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 950;
}

function removeInBack() {
  const data = document.body.$('main-element').state.data;
  data.splice(950, 50);
  document.body.$('main-element').update();

  return document.body.$('main-element').$$('tr').length === 950;
}

module.exports = [addInFront, addInBack, removeInFront, removeInBack, swapback, swapforward, swapForwardBackward, swapForwardBackwardMultiple, shrink, add, replace, updateAll, replaceAndAdd, replaceAndRemove, rearrange, rearrange2];
