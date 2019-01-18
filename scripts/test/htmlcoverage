#!/usr/bin/env node

const fs = require('fs'),
  path = require('path'),
  cov = require('istanbul-lib-coverage'),
  loadDir = require('./loaddir'),
  reporter = require('istanbul-api').createReporter();

const map = cov.createCoverageMap({});
const nycReport = path.join(__dirname, '../../.nyc_output');

if (fs.existsSync(nycReport)) {
  const allFiles = [];
  loadDir(nycReport, (file) => {
    if (file.match(/\.json$/)) allFiles.push(file);
  });

  allFiles.forEach((file) => {
    map.merge(JSON.parse(fs.readFileSync(file)));
  });
  reporter.add('html');

  reporter.write(map);
}
