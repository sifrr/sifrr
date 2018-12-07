#!/usr/bin/env node

const exec = require('child_process').execSync;
const execa = require('child_process').exec;

function execSync(command) {
  exec(command, (err, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (err !== null) {
      console.log(`exec error: ${err}`);
    }
  });
}

function execAsync(command) {
  return execa(command, (err, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (err !== null) {
      console.log(`exec error: ${err}`);
    }
  });
}

module.exports = {
  execSync: execSync,
  exec: execSync,
  execAsync: execAsync
}
