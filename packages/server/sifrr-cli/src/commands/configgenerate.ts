import { Command } from '../types';
import configTemplate from '../templates/config';
import createFile from '../utils/createfile';
import path from 'path';

const ConfigGenerate: Command = argv => {
  const elemPath = path.resolve(`./sifrr.config.js`);
  const elemHtml = configTemplate();

  createFile(elemPath, elemHtml, argv.force === 'true');
};

export default ConfigGenerate;
