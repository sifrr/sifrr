import fs from 'fs';
import path from 'path';
import elemTemplate from '../templates/element';
import { Command } from '../types';
import createFile from '../utils/createfile';

const ElementGenerate: Command = (
  { name, path: filePath, force, extends: ext },
  { elementNameToFileName, elementMapFile, elementsFolder }
) => {
  // Element class
  const elemName: string = name;
  const fileName = `./${elementNameToFileName(elemName)}`;
  // Loader
  const elemPath = filePath ? filePath : path.resolve(elementsFolder, fileName);
  const className = elemName
    .replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())
    .replace(/^([a-z])/, (g: string) => g[0].toUpperCase());

  const elemHtml = elemTemplate(className, ext);

  createFile(elemPath, elemHtml, force === true);

  if (fs.existsSync(elementMapFile)) {
    fs.appendFileSync(
      elementMapFile,
      `\n
export const ${elemName} = '${path.relative(elementMapFile, elemPath)}';
`
    );
  }
};

export default ElementGenerate;
