const Busboy = require('busboy');

module.exports = function(contType, options = {}) {
  options.headers = {
    'content-type': contType
  };
  return new Promise((resolve, reject) => {
    const busb = new Busboy(options);
    const response = {};

    this.bodyStream().pipe(busb);

    busb.on('file', function(fieldname, file, filename, encoding, mimetype) {
      const resp = {
        filename,
        encoding,
        mimetype
      };
      options.onFile(fieldname, file, filename, encoding, mimetype);
      if (Array.isArray(response[fieldname])) {
        response[fieldname].push(resp);
      } else if (response[fieldname]) {
        response[fieldname] = [response[fieldname], resp];
      }  else {
        response[fieldname] = resp;
      }
    });
    busb.on('field', function(fieldname, value) {
      if (typeof options.onField === 'function') options.onField(fieldname, value);
      if (Array.isArray(response[fieldname])) {
        response[fieldname].push(value);
      } else if (response[fieldname]) {
        response[fieldname] = [response[fieldname], value];
      }  else {
        response[fieldname] = value;
      }
    });
    busb.on('finish', function() {
      resolve(response);
    });
    busb.on('error', reject);
  });
};
