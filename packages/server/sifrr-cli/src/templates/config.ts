export default () => `module.exports = {
  elementsFolder: 'client/elements',
  elementMap: 'client/element-map.js',
  elementNameToFileName: elementName => \`\${elementName}.js\`
};
`;
