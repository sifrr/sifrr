function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}

function buildData(count = 10, from = 1) {
  const adjectives = [
    'pretty',
    'large',
    'big',
    'small',
    'tall',
    'short',
    'long',
    'handsome',
    'plain',
    'quaint',
    'clean',
    'elegant',
    'easy',
    'angry',
    'crazy',
    'helpful',
    'mushy',
    'odd',
    'unsightly',
    'adorable',
    'important',
    'inexpensive',
    'cheap',
    'expensive',
    'fancy'
  ];
  const colours = [
    'red',
    'yellow',
    'blue',
    'green',
    'pink',
    'brown',
    'purple',
    'brown',
    'white',
    'black',
    'orange'
  ];
  const nouns = [
    'table',
    'chair',
    'house',
    'bbq',
    'desk',
    'car',
    'pony',
    'cookie',
    'sandwich',
    'burger',
    'pizza',
    'mouse',
    'keyboard'
  ];
  const data = [];
  for (let i = 0; i < count; i++)
    data.push({
      id: i + from,
      key: i + from,
      label:
        adjectives[_random(adjectives.length)] +
        ' ' +
        colours[_random(colours.length)] +
        ' ' +
        nouns[_random(nouns.length)]
    });
  from = from + count;
  return data;
}

function dataToChildNodes(data) {
  const ret = data.map(d => {
    const node = {
      state: d
    };
    node._getStub = sinon.stub().callsFake(() => node.state);
    node._setStub = sinon.stub().callsFake(v => (node.state = v));
    node.getState = node._getStub;
    node.setState = node._setStub;
    node.key = d.key;
    return node;
  });
  ret.forEach(n => {
    Object.defineProperty(n, 'nextSibling', {
      get: () => ret[findIndex(ret, n) + 1]
    });
    Object.defineProperty(n, 'previousSibling', {
      get: () => ret[findIndex(ret, n) - 1]
    });
    n.replaceWith = function(x) {
      const idx = findIndex(ret, n);
      ret[idx] = x;
    };
  });
  return ret;
}

function dataToChildNode(d) {
  return dataToChildNodes([d])[0];
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
      if (indexOld > -1) childNodes.splice(indexOld, 1);
      if (b) {
        const indexNew = findIndex(childNodes, b);
        childNodes.splice(indexNew, 0, a);
      } else this.appendChild(a);
    },
    removeChild: function(a) {
      const indexOld = findIndex(childNodes, a);
      this.childNodes.splice(indexOld, 1);
    },
    appendChild: function(a) {
      this.childNodes.push(a);
    }
  };
  for (const name in parent) {
    sinon.spy(parent, name);
  }
  parent.childNodes = childNodes;
  childNodes.forEach(cn => (cn.parentNode = parent));
  Object.defineProperty(parent, 'firstChild', {
    get: () => parent.childNodes[0]
  });
  Object.defineProperty(parent, 'lastChild', {
    get: () => parent.childNodes[parent.childNodes.length - 1]
  });
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
  dataToChildNode,
  dataToChildNodes,
  parent,
  moveEl,
  findIndex
};
