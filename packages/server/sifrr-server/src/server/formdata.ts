import { join } from 'path';
import Busboy, { BusboyConfig } from 'busboy';
import mkdirp from 'mkdirp';
import { SifrrResponse, UploadedFile, UploadFileConfig } from '@/server/types';
import { v4 as uuid } from 'uuid';
import { getExt } from '@/server/mime';
import fs from 'fs';
import { buffer } from 'stream/consumers';
import { stob } from '@/server/utils';
import { Readable } from 'stream';

function formData(
  this: SifrrResponse,
  headers: Record<string, string>,
  options: UploadFileConfig = {}
) {
  (options as BusboyConfig).headers = headers;

  if (typeof options.destinationDir === 'string') {
    mkdirp.sync(options.destinationDir);
  }

  return new Promise((resolve, reject) => {
    const busb = Busboy(options);
    const ret = {};
    const promises: Promise<any>[] = [Promise.resolve()];

    busb.on('partsLimit', function () {
      reject(Error('LIMIT_PART_COUNT'));
    });
    busb.on('filesLimit', function () {
      reject(Error('LIMIT_FILE_COUNT'));
    });
    busb.on('fieldsLimit', function () {
      reject(Error('LIMIT_FIELD_COUNT'));
    });

    busb.on(
      'file',
      function (fieldname, fileStream, { filename: originalname, encoding, mimeType }) {
        if (!originalname) return fileStream.resume();

        const value: Partial<UploadedFile> = {
          fieldname,
          originalname,
          encoding,
          mimeType,
          path: undefined
        };

        Object.defineProperty(value, 'stream', {
          configurable: true,
          enumerable: false,
          value: fileStream
        });

        fileStream.on('error', reject);
        fileStream.on('limit', function () {
          reject(Error('LIMIT_FILE_SIZE: ' + fieldname));
        });

        promises.push(
          stob(fileStream).then((b) => {
            value.size = b.length;
            if (typeof options.destinationDir === 'string') {
              const ext = getExt(mimeType);
              const finalPath = join(options.destinationDir, uuid() + (ext ? `.${ext}` : ''));

              value.path = finalPath;
              value.destination = options.destinationDir;

              const outStream = fs.createWriteStream(finalPath);
              outStream.on('error', reject);

              Readable.from(b).pipe(outStream);
            } else {
              value.buffer = b;
            }
            return b;
          })
        );

        setRetValue(ret, fieldname, value);
      }
    );

    busb.on('field', function (fieldname, value) {
      setRetValue(ret, fieldname, value);
    });

    busb.on('finish', function () {
      Promise.all(promises)
        .then(() => resolve(ret))
        .catch(reject);
    });

    busb.on('error', reject);

    this.bodyStream.pipe(busb);
  });
}

function setRetValue(
  ret: { [x: string]: any },
  fieldname: string,
  value: Partial<UploadedFile> | string
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
