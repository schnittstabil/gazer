#!/usr/bin/env node
var gazer = require('../');

var argv = require('yargs')
  .usage('Usage: gazer -p "**/*.js" -- <your command>')
  .demand('p')
  .demand(1, 'You must provide a command to run')
  .alias('p', 'pattern')
  .describe('p', 'Files to watch, globbing supported')
  .argv;

gazer(argv.pattern, argv._[0], argv._.slice(1));
