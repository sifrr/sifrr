function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}

function buildData(count = 10, from = 1) {
  const adjectives = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive',
    'cheap', 'expensive', 'fancy'
  ];
  const colours = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
  const nouns = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse', 'keyboard'];
  let data = [];
  for (let i = 0; i < count; i++)
    data.push({
      id: i + from,
      label: adjectives[_random(adjectives.length)] + ' ' + colours[_random(colours.length)] + ' ' + nouns[_random(nouns.length)]
    });
  from = from + count;
  return data;
}

function dataToChildNodes(data) {
  const ret = data.map(d => {
    const node = {
      _state: d
    };
    node._getStub = sinon.stub().callsFake(() => node._state);
    node._setStub = sinon.stub().callsFake((v) => node._state = v);
    Object.defineProperty(node, 'state', {
      get: node._getStub,
      set: node._setStub
    });
    return node;
  });
  return ret;
}

function findIndex(childNodes, a) {
  if (typeof a === 'number') {
    return childNodes.findIndex(n => n.state.id === a);
  } else {
    return childNodes.findIndex(n => n.state.id === a.state.id);
  }
}

function parent(childNodes) {
  const parent = {
    insertBefore: function(a, b) {
      const childNodes = this.childNodes;
      const indexOld = findIndex(childNodes, a);
      childNodes.splice(indexOld, 1);
      if (b) {
        const indexNew = findIndex(childNodes, b);
        childNodes.splice(indexNew, 0, a)[0];
      } else this.appendChild(a);
    },
    removeChild: function(a) {
      const indexOld = findIndex(childNodes, a);
      this.childNodes.splice(indexOld, 1);
    },
    appendChild: function(a) {
      this.childNodes.push(a);
    },
  };
  for (let name in parent) {
    sinon.spy(parent, name);
  }
  parent.childNodes = childNodes;
  return parent;
}

function moveEl(arr, oldPosition, newPosition) {
  if (newPosition >= arr.length) {
    let k = newPosition - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  return arr.splice(newPosition, 0, arr.splice(oldPosition, 1)[0]);
}

module.exports = {
  buildData,
  dataToChildNodes,
  parent,
  moveEl,
  findIndex
};