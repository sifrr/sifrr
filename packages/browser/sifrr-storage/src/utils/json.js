const toS = Object.prototype.toString;
const l = 6, uId = Math.random().toString(36).slice(-1 * l);

class Json {
  static parse(data) {
    let ans = data;
    if (typeof data === 'string') {
      try {
        ans = this.parse(JSON.parse(data));
      } catch(e) {
        // do nothing
      }
      if (typeof ans === 'string') {
        const i = ans.indexOf(uId);
        if (i > 0) {
          const [type, av] = ans.split(uId);
          if (type === 'ArrayBuffer') ans = new window.Uint8Array(av.split(',')).buffer;
          else ans = new window[type](av.split(','));
        }
      }
    } else if (Array.isArray(data)) {
      ans = [];
      data.forEach((v, i) => {
        ans[i] = this.parse(v);
      });
    } else if (typeof data === 'object') {
      if (data === null) return null;
      ans = {};
      for (const k in data) {
        ans[k] = this.parse(data[k]);
      }
    }
    return ans;
  }

  static stringify(data) {
    if (typeof data !== 'object') return data;
    let ans;
    const type = toS.call(data).slice(8, -1);
    switch (type) {
    case 'Object':
      ans = {};
      for (let k in data) {
        ans[k] = this.stringify(data[k]);
      }
      ans = JSON.stringify(ans);
      break;
    case 'ArrayBuffer':
      ans = type + uId + new window.Uint8Array(data).toString();
      break;
    default:
      ans = type + uId + data.toString();
      break;
    }
    return ans;
  }
}

module.exports = Json;
