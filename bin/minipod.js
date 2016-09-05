#!/usr/bin/env node
const program = require('commander');
const appInfo = require('./../package.json');
const simpleGit = require('simple-git');
const homedir = require('homedir')();
const https = require('https');
const fs = require('fs');
const mkdirp = require('mkdirp');
const util = require('util');
const log = console.log

const specDownloadUrlFmt = "https://raw.githubusercontent.com/CocoaPods/Specs/master/Specs/%s/%s/%s.podspec.json";

function updateRepo(repoName) {
  var git = simpleGit(homedir + '/.cocoapods/repos/'+repoName);
  git.pull();
}

function addSpecToRepo(repoName, podName, podVersion) {
  const podDir = homedir + "/.cocoapods/repos/" + repoName + "/Specs/" + podName + "/" + podVersion;
  const file = podDir + "/" + podName + ".podspec.json";
  var git = simpleGit(homedir + '/.cocoapods/repos/' + repoName);

  git.add(".");
  git.commit("add " + podName + "[" + podVersion + "]");
  git.push();
  log("install " + podName + "[" + podVersion + "] success");
}

function downloadSpec(repoName, podName, podVersion) {
  const podDir = homedir + "/.cocoapods/repos/" + repoName + "/Specs/" + podName + "/" + podVersion;
  fs.access(podDir, fs.F_OK, function(err) {
      mkdirp(podDir, function(err) {
        if(err) {
          console.error(err);
          return;
        }
        
        const specDownloadUrl = util.format(specDownloadUrlFmt, podName, podVersion, podName);
        var file = fs.createWriteStream(podDir + "/" + podName + ".podspec.json");
        var request = https.get(specDownloadUrl, function(response) {
          response.pipe(file);
          log("pod["+podName+"("+podVersion+")] download success");

          addSpecToRepo(repoName, podName, podVersion);
        });
      });
  });
}

program
  .version(appInfo.version)
  .usage('add <podName> <podVersion> [-r repoName]')
  .option('-r, --repo <repoName>', 'repo name under ~/.cocoapods/repos folder')
  .arguments('<cmd> <podName> <podVersion>')
  .action(function(cmd, podName, podVersion, options) {
    if (cmd !== 'add' && cmd !== 'config') {
      program.help();
      return;
    }

    const repoName = options.repo
    updateRepo(repoName);
    downloadSpec(repoName, podName, podVersion);
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

