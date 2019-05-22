const toS = Object.prototype.toString;
const uId = '~~SifrrStorage84l23g5k34~~';

function decodeBlob(str, type) {
  return new Blob([new window.Uint8Array(str.split(',')).buffer], { type });
}

function encodeBlob(blob) {
  const uri = URL.createObjectURL(blob),
    xhr = new XMLHttpRequest();

  xhr.open('GET', uri, false);
  xhr.send();

  URL.revokeObjectURL(uri);

  const ui8 = new Uint8Array(xhr.response.length);
  for (let i = 0; i < xhr.response.length; ++i) {
    ui8[i] = xhr.response.charCodeAt(i);
  }
  return ui8.toString();
}

class Json {
  static parse(data) {
    let ans = data;
    if (typeof data === 'string') {
      try {
        ans = data = JSON.parse(data);
      } catch(e) {
        // do nothing
      }
    }

    if (typeof data === 'string') {
      const i = data.indexOf(uId);
      if (i > 0) {
        const [type, av, av2] = data.split(uId);
        if (type === 'ArrayBuffer') ans = new window.Uint8Array(av.split(',')).buffer;
        else if (type === 'Blob') ans = decodeBlob(av2, av);
        else ans = new window[type](av.split(','));
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
    if (typeof data !== 'object') return JSON.stringify(data);
    if (data === null) return 'null';
    if (Array.isArray(data)) return JSON.stringify(data.map(d => this.stringify(d)));
    const type = toS.call(data).slice(8, -1);
    if (type === 'Object') {
      let ans = {};
      for (let k in data) {
        ans[k] = this.stringify(data[k]);
      }
      return JSON.stringify(ans);
    } else if (type === 'ArrayBuffer') {
      data = new window.Uint8Array(data);
    } else if (type === 'Blob') {
      data = data.type + uId + encodeBlob(data);
    }
    return type + uId + data.toString();
  }
}

module.exports = Json;
