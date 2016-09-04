#!/usr/bin/env node
const program = require('commander');
const appInfo = require('./../package.json');
const log = console.log

program
  .version(appInfo.version)
  .usage('add <podName> <podVersion> [-r repoName]')
  .option('-r, --repo <repoName>', 'repo name under ~/.cocoapods/repos folder')
  .arguments('<cmd> <podName> <podVersion>')
  .action(function(cmd, podName, podVersion, options) {
    log("cmd: " + cmd)
  	log("podName: " + podName)
    log("podVersion: " + podVersion)
    log("repo: " + options.repo)
  });

program
  .on('--help', function() {
    log('  Examples:');
    log();
    log('    $ minipod add AFNetworking 3.1.0');
    log('    $ minipod add AFNetworking 3.1.0 -r 18plan');
    log();
  });

program.parse(process.argv);