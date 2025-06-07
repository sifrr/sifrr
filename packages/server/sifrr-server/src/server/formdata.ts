import { createWriteStream, statSync } from 'fs';
import { join, dirname } from 'path';
import Busboy from 'busboy';
import mkdirp from 'mkdirp';
import { SifrrResponse, UploadedFile, UploadFileConfig } from '@/server/types';
import { v4 as uuid } from 'uuid';
import { getExt } from '@/server/mime';
import { buffer } from 'stream/consumers';

function formData(this: SifrrResponse, contType: string, options: UploadFileConfig = {}) {
  options.headers = {
    'content-type': contType
  };

  return new Promise((resolve, reject) => {
    const busb = new Busboy(options);
    const ret = {};
    const promises: Promise<any>[] = [Promise.resolve()];

    this.bodyStream().pipe(busb);

    busb.on('limit', () => {
      if (options.abortOnLimit) {
        reject(Error('limit'));
      }
    });

    busb.on('file', function (fieldname, file, filename, encoding, mimetype) {
      const value: Partial<UploadedFile> = {
        fieldname,
        stream: file,
        originalname: filename,
        encoding,
        mimetype,
        path: undefined
      };

      if (typeof options.localDir === 'string') {
        const ext = getExt(mimetype);
        const fileToSave = join(options.localDir, uuid() + ext ? `.${ext}` : '');
        mkdirp(dirname(fileToSave));

        file.pipe(createWriteStream(fileToSave));
        value.path = fileToSave;
        try {
          value.size = statSync(fileToSave).size;
        } catch (_e) {}
      } else {
        promises.push(
          buffer(file).then((bfr) => {
            value.buffer = bfr;
            value.size = bfr.byteLength;
          })
        );
      }

      setRetValue(ret, fieldname, value);
    });

    busb.on('field', function (fieldname, value) {
      setRetValue(ret, fieldname, value);
    });

    busb.on('finish', function () {
      Promise.all(promises).then(() => resolve(ret));
    });

    busb.on('error', reject);
  });
}

function setRetValue(
  ret: { [x: string]: any },
  fieldname: string,
  value: { filename: string; encoding: string; mimetype: string; filePath?: string } | any
) {
  if (fieldname.endsWith('[]')) {
    fieldname = fieldname.substring(0, fieldname.length - 2);
  }
  if (Array.isArray(ret[fieldname])) {
    ret[fieldname].push(value);
  } else if (ret[fieldname]) {
    ret[fieldname] = [ret[fieldname], value];
  } else {
    ret[fieldname] = value;
  }
}

export default formData;
