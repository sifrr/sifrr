import { join } from 'path';
import Busboy, { BusboyConfig } from 'busboy';
import mkdirp from 'mkdirp';
import { SifrrResponse, UploadedFile, FormDataConfig } from '@/server/types';
import { v4 as uuid } from 'uuid';
import { getExt } from '@/server/mime';
import { defer, stob, stof } from '@/server/utils';

function formData(
  this: SifrrResponse,
  headers: Record<string, string>,
  options: FormDataConfig = {}
) {
  (options as BusboyConfig).headers = headers;

  if (typeof options.destinationDir === 'string') {
    mkdirp.sync(options.destinationDir);
  }

  return new Promise((resolve, reject) => {
    const busb = Busboy(options);
    const ret: Record<string, string | string[] | UploadedFile | UploadedFile[]> = {};
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
        if (options.fields) {
          if (options.fields[fieldname]) {
            const max = options.fields[fieldname].maxCount ?? Infinity;
            if (
              max === 0 ||
              (max === 1 && ret[fieldname]) ||
              (Array.isArray(ret[fieldname]) && ret[fieldname].length >= max)
            ) {
              return fileStream.resume();
            }
          } else {
            return fileStream.resume();
          }
        }

        const value: Partial<UploadedFile> = {
          fieldname,
          originalname,
          stream: fileStream,
          encoding,
          mimeType,
          path: undefined
        };

        options.handleFileStream?.(value as any);
        if (fileStream.readableEnded) return;

        fileStream.on('error', reject);
        fileStream.on('limit', function () {
          reject(Error('LIMIT_FILE_SIZE: ' + fieldname));
        });

        const { promise, resolve: res, reject: rej } = defer<void>();

        promises.push(promise);

        if (typeof options.destinationDir === 'string') {
          const ext = getExt(mimeType);
          const finalPath = join(options.destinationDir, uuid() + (ext ? `.${ext}` : ''));

          value.path = finalPath;
          value.destination = options.destinationDir;
          stof(fileStream, finalPath)
            .then((size) => {
              value.size = size;
              res();
            })
            .catch(rej);
        } else {
          stob(fileStream)
            .then((b) => {
              value.size = b.length;
              value.buffer = b;
              res();
            })
            .catch(rej);
        }

        if (options.filterFile?.(value as any) === false) return;
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
