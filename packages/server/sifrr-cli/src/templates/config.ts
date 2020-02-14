import { SifrrConfig } from '../types';

export const defaultConfig = (typescript = false): SifrrConfig => ({
  typescript,
  elementsFolder: 'client/elements',
  elementMapFile: 'client/element-map.js',
  elementNameToFileName: elementName => `${elementName}.js`
});

const toString = (object: object): string => {
  return `{
  ${Object.keys(object)
    .map(k => `${k}: ${JSON.stringify(object[k]) || String(object[k])}`)
    .join(',\n  ')}
}`;
};

export default () => `module.exports = ${toString(defaultConfig(false))};
`;
