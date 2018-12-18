class Json {
  static parse(data) {
    let ans = {};
    if (typeof data == 'string') {
      try {
        ans = JSON.parse(data);
      } catch(e) {
        return data;
      }
      return this.parse(ans);
    } else if (Array.isArray(data)) {
      ans = [];
      data.forEach((v, i) => {
        ans[i] = this.parse(v);
      });
    } else if (typeof data == 'object') {
      for (const k in data) {
        ans[k] = this.parse(data[k]);
      }
    } else {
      return data;
    }
    return ans;
  }

  static stringify(data) {
    if (typeof data == 'string') {
      return data;
    } else {
      return JSON.stringify(data);
    }
  }

  static deepClone(json) {
    if (Array.isArray(json)) return Array.prototype.slice.call(json);
    if (typeof json !== 'object') return json;
    let clone = {};
    for (let key in json) {
      clone[key] = Json.deepClone(json[key]);
    }
    return clone;
  }
}

module.exports = Json;
