module.exports = function(api) {
  api.cache(true);
  const presets = [
    [
      '@babel/env',
      {
        modules: false,
        targets: require('./package.json').browserslist
      }
    ]
  ];

  const plugins = [['@babel/plugin-proposal-class-properties', { loose: true }]];

  return {
    presets,
    plugins
  };
};
