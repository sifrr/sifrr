import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import Busboy from 'busboy';
import mkdirp from 'mkdirp';

function formData(contType, options: any = {}) {
  options.headers = {
    'content-type': contType
  };

  return new Promise((resolve, reject) => {
    const busb = new Busboy(options);
    const ret = {};

    this.bodyStream().pipe(busb);

    busb.on('limit', () => {
      if (options.abortOnLimit) {
        reject(Error('limit'));
      }
    });

    busb.on('file', function(fieldname, file, filename, encoding, mimetype) {
      const value: any = {
        filename,
        encoding,
        mimetype
      };

      if (typeof options.tmpDir === 'string') {
        if (typeof options.filename === 'function') filename = options.filename(filename);
        const fileToSave = join(options.tmpDir, filename);
        mkdirp(dirname(fileToSave));

        file.pipe(createWriteStream(fileToSave));
        value.filePath = fileToSave;
      } else options.onFile(fieldname, file, filename, encoding, mimetype);

      setRetValue(ret, fieldname, value);
    });

    busb.on('field', function(fieldname, value) {
      if (typeof options.onField === 'function') options.onField(fieldname, value);

      setRetValue(ret, fieldname, value);
    });

    busb.on('finish', function() {
      resolve(ret);
    });

    busb.on('error', reject);
  });
}

function setRetValue(ret, fieldname, value) {
  if (fieldname.slice(-2) === '[]') {
    fieldname = fieldname.slice(0, fieldname.length - 2);
    if (Array.isArray(ret[fieldname])) {
      ret[fieldname].push(value);
    } else {
      ret[fieldname] = [value];
    }
  } else {
    if (Array.isArray(ret[fieldname])) {
      ret[fieldname].push(value);
    } else if (ret[fieldname]) {
      ret[fieldname] = [ret[fieldname], value];
    } else {
      ret[fieldname] = value;
    }
  }
}

export default formData;
