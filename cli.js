#!/usr/bin/env node
'use strict';
var gazer = require('./');

var argv = require('yargs')
  .usage('Usage: gazer -v -p \'**/*.js\' -- <your command>')
  .alias('v', 'verbose')
  .describe('v', 'Turn on verbose output')
  .demand('p')
  .alias('p', 'pattern')
  .describe('p', 'Files to watch, globbing supported')
  .demand(1, 'You must provide a command to run')
  .argv;

var pattern = argv.pattern;
var cmd = argv._[0];
var args = argv._.slice(1);
var opts = argv;

// delete non gazer options
delete opts.pattern;
delete opts.v;
delete opts.p;
delete opts._;
delete opts.$0;

gazer([].concat(pattern), cmd, args, opts);
