#! /usr/bin/env node

const path = require('path');
const { Command } = require('commander');
const program = new Command();

const pkg = require('../package');
const pkg2 = require('..');
const Downloader = require('..');
program
  .name('ddi')
  .description('download iconfont file')
  .version(pkg.version);

program.command('start')
  .description('开始下载iconfont 文件')
//   .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-o, --output <string>', 'separator character', ',')
  .action((str, options) => {
    const output = str.output || '.';
    new Downloader({output});
  });

program.parse();