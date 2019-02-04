module.exports = function (api) {
  api.cache(true);
  const presets = [
    ['@babel/env', {
      modules: false,
      targets: {
        chrome: 55,
        safari: 11,
        opera: 42,
        firefox: 63
      }
    }]
  ];

  return {
    presets
  };
};
