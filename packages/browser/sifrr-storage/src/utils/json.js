class Json {
  static parse(data) {
    let ans = data;
    if (typeof data == 'string') {
      try {
        return this.parse(JSON.parse(data));
      } catch(e) {
        return data;
      }
    } else if (Array.isArray(data)) {
      ans = [];
      data.forEach((v, i) => {
        ans[i] = this.parse(v);
      });
    } else if (typeof data == 'object') {
      if (data === null) return null;
      ans = {};
      for (const k in data) {
        ans[k] = this.parse(data[k]);
      }
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
}

module.exports = Json;
