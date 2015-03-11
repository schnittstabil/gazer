#!/usr/bin/env node
var gazer = require('../');

var argv = require('yargs')
  .usage('Usage: gazer -p "**/*.js" -- <your command>')
  .demand('p')
  .demand(1, 'You must provide a command to run')
  .alias('p', 'pattern')
  .describe('p', 'Files to watch, globbing supported')
  .argv;

var pattern = argv.pattern;
var cmd = argv._[0];
var args = argv._.slice(1);
var opts = argv;

// delete non gazer options
delete opts.pattern;
delete opts.p;
delete opts._;
delete opts.$0;

gazer(pattern, cmd, args, opts);
