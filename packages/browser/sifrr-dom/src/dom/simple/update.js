const updateAttribute = require('../custom/updateattribute');

function simpleElementUpdate(simpleEl) {
  const doms = simpleEl._refs, refs = simpleEl.stateMap, l = refs.length;
  for (let i = 0; i < l; i++) {
    const data = refs[i].ref, dom = doms[i];
    if (Array.isArray(data)) {
      const l = data.length;
      for (let i = 0; i < l; i++) {
        updateAttribute(dom, data[i].name, simpleEl.state[data[i].text]);
      }
    } else {
      if (dom.data != simpleEl.state[data]) dom.data = simpleEl.state[data] || '';
    }
  }
}

module.exports = simpleElementUpdate;
