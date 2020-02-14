import path from 'path';
import configTemplate from '../templates/config';
import { Command } from '../types';
import createFile from '../utils/createfile';

const ConfigGenerate: Command = argv => {
  const elemPath = path.resolve(`./sifrr.config.js`);
  const elemHtml = configTemplate();

  createFile(elemPath, elemHtml, argv.force === true);
};

export default ConfigGenerate;
