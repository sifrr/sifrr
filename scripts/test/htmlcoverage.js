#!/usr/bin/env node

const fs = require('fs'),
  path = require('path'),
  cov = require('istanbul-lib-coverage'),
  srcmap = require('istanbul-lib-source-maps'),
  { createInstrumenter } = require('istanbul-lib-instrument'),
  loadDir = require('./loaddir'),
  reporter = require('istanbul-api').createReporter();

let map = cov.createCoverageMap();
const instrumenter = createInstrumenter();
const sm = srcmap.createSourceMapStore({});
const nycReport = path.join(__dirname, '../../.nyc_output');

if (fs.existsSync(nycReport)) {
  // Browser tests
  const browserFiles = [];
  loadDir(nycReport, (file) => {
    if (file.match(/browser-coverage\.json$/)) browserFiles.push(file);
  });

  browserFiles.forEach((file) => {
    const cont = JSON.parse(fs.readFileSync(file));
    map.merge(cont);
  });

  map = sm.transformCoverage(map).map;

  // unit tests
  const unitFiles = [];
  loadDir(nycReport, (file) => {
    if (file.match(/unit-coverage\.json$/)) unitFiles.push(file);
  });

  unitFiles.forEach((file) => {
    const cont = JSON.parse(fs.readFileSync(file));
    map.merge(cont);
  });

  // Add Other files without coverage
  loadDir(path.join(__dirname, '../../packages'), (file) => {
    if (file.match(/sifrr-[a-z]+\/src\/.*\.js$/)) {
      if (!map.data[file]) {
        const content = fs.readFileSync(file).toString();
        instrumenter.instrumentSync(content, file);
        const emptyCov = {};
        emptyCov[file] = instrumenter.fileCoverage;
        map.merge(emptyCov);
      }
    }
  });

  reporter.add('html');
  if (process.env.LCOV === 'true') reporter.add('lcov');
  reporter.write(map);
}
