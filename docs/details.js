const pkg = require('../package.json');
const version = pkg.version;

module.exports = {
  '@sifrr/dom': {
    description: '< 5KB DOM library. If Polymer and react had a better, faster baby.',
    version: version,
    peerDependencies: ['@sifrr/fetch']
  },
  '@sifrr/fetch': {
    description: 'Fetch based http requests library for browsers.',
    version: version,
    peerDependencies: []
  },
  '@sifrr/route': {
    description: 'History API based Routing library for building One Page Applications with sifrr-dom.',
    version: version,
    peerDependencies: ['@sifrr/dom']
  },
  '@sifrr/serviceworker': {
    description: 'Easily customizable Service Worker.',
    version: version,
    peerDependencies: []
  },
  '@sifrr/storage': {
    description: 'Browser persisted key-value(JSON) storage library with cow powers.',
    version: version,
    peerDependencies: []
  },
  '@sifrr/api': {
    description: 'Library for creating normal apis or GraphQL apis.',
    version: version,
    peerDependencies: []
  },
  '@sifrr/cli': {
    description: 'Sifrr Command line interface.',
    version: version,
    peerDependencies: []
  },
  '@sifrr/seo': {
    description: 'Server Side Redering for any js based app as a express middleware.',
    version: version,
    peerDependencies: []
  }
};
