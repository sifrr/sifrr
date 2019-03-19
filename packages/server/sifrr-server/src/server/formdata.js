const { Readable } = require('stream');
const Busboy = require('busboy');
const noOp = () => true;

module.exports = function(contType, options = {}) {
  options.headers = {
    'content-type': contType
  };
  return new Promise((resolve, reject) => {
    const busb = new Busboy(options);
    const stream = new Readable();
    const response = {};

    stream._read = noOp;
    this.body().then(body => {
      stream.push(body);
      stream.push(null);
    });

    stream.pipe(busb);

    busb.on('file', function(fieldname, file, filename, encoding, mimetype) {
      const resp = {
        type: 'file',
        fieldname,
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
      const resp = {
        type: 'field',
        value
      };
      if (typeof options.onField === 'function') options.onField(fieldname, value);
      if (Array.isArray(response[fieldname])) {
        response[fieldname].push(resp);
      } else if (response[fieldname]) {
        response[fieldname] = [response[fieldname], resp];
      }  else {
        response[fieldname] = resp;
      }
    });
    busb.on('finish', function() {
      resolve(response);
    });
    busb.on('error', reject);
  });
};
