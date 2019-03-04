#!/usr/bin/env node

const execa = require('child_process').exec;

function execAsync(command) {
  return new Promise((res, rej) => {
    execa(command, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(`stdout: ${stdout}`);
      if (stderr) process.stdout.write(`stderr: ${stderr}`);
      if (err !== null) {
        process.stdout.write(`exec error: ${err}`);
        rej(err);
      }
      res({ stdout, stderr });
    });
  });
}

module.exports =  execAsync;
