import mime from 'mime/lite';

const getMimetype = (path: string): string | null => {
  return mime.getType(path);
};

const getExt = (mimetype: string): string | null => {
  return mime.getExtension(mimetype);
};

export { getMimetype, getExt };
