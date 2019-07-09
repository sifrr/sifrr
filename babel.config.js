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

  return {
    presets
  };
};
