module.exports = function () {
  const presets = [
    ['@babel/env', {
      targets: {
        chrome: 55,
        safari: 11,
        opera: 42,
        firefox: 53
      },
      modules: false
    }]
  ];
  const plugins = [
    '@babel/plugin-external-helpers'
  ];

  return {
    presets,
    plugins
  };
};