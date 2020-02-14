import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

export default function createFile(elemPath: string, content: string, force = false) {
  mkdirp.sync(path.dirname(elemPath));

  if (fs.existsSync(elemPath) && !force) {
    process.stderr.write(`File already exists at ${elemPath}`);
    process.exit(1);
  }

  fs.writeFileSync(elemPath, content);

  process.stdout.write(`File was saved at '${elemPath}'!`);
  return true;
}
