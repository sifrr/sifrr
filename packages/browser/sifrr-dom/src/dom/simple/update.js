function simpleElementUpdate(simpleEl) {
  const doms = simpleEl._refs, refs = simpleEl.stateMap, l = refs.length;
  for (let i = 0; i < l; i++) {
    const data = refs[i].ref, dom = doms[i];
    if (Array.isArray(data)) {
      const l = data.length;
      for (let i = 0; i < l; i++) {
        const attr = data[i];
        if (dom.getAttribute(attr.name) !== simpleEl.state[attr.text]) {
          dom.setAttribute(attr.name, simpleEl.state[attr.text] || '');
        }
      }
    } else {
      if (dom.data != simpleEl.state[data]) dom.data = simpleEl.state[data] || '';
    }
  }
}

module.exports = simpleElementUpdate;
