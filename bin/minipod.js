#!/usr/bin/env node
const program = require('commander');
const appInfo = require('./../package.json');
const simpleGit = require('simple-git');
const homedir = require('homedir')();
const https = require('https');
const fs = require('fs');
const mkdirp = require('mkdirp');
const util = require('util');
const isThere = require("is-there");
const log = console.log

const specDownloadUrlFmt = "https://raw.githubusercontent.com/CocoaPods/Specs/master/Specs/%s/%s/%s.podspec.json";
const reposDir = homedir + '/.cocoapods/repos';
const podSpecPathFmt = 'Specs/%s/%s';
const podSpecFilePostfix = ".podspec.json";

function downloadSpecAndUpdate(podName, podVersion, repoDir) {
  const git = simpleGit(repoDir);
  const podDir = repoDir + "/Specs/" + podName + "/" + podVersion;
  
  git.pull(function(){
    fs.access(podDir, fs.F_OK, function(err) {
      mkdirp(podDir, function(err) {
        if(err) {
          console.error(err);
          return;
        }
        
        const specDownloadUrl = util.format(specDownloadUrlFmt, podName, podVersion, podName);
        const podFilePath = podDir + "/" + podName + podSpecFilePostfix;
        var file = fs.createWriteStream(podFilePath);
        var request = https.get(specDownloadUrl, function(response) {
          if(response.statusCode === 404){
            log("pod "+podName+"["+podVersion+"] not exists!");
            return
          }

          if (response.statusCode !== 200){
            log("pod "+podName+"["+podVersion+"] download failure");
            return
          }
          response.pipe(file);
          log("pod "+podName+"["+podVersion+"] download success");

          git.add(".", function(){
            git.commit("add " + podName + "[" + podVersion + "]", function(){
              git.push(function(){
                log("pod " + podName + "[" + podVersion + "] install success");
              })
            });
          });
        });
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
    const repoDir = reposDir + '/' + repoName
    if (!isThere(repoDir)) {
      log("repo["+repoName+"] not exist in ~/.cocoapods/repos")
      return;
    }

    downloadSpecAndUpdate(podName, podVersion, repoDir);
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

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

