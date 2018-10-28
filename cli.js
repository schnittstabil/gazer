#!/usr/bin/env node
'use strict';
const yargs = require('yargs');
const gazer = require('.');

const {argv} = yargs
	.usage('Usage: gazer -v -p \'**/*.js\' -- <your command>')
	.alias('v', 'verbose')
	.describe('v', 'Turn on verbose output')
	.demand('p')
	.alias('p', 'pattern')
	.describe('p', 'Files to watch, globbing supported')
	.demand(1, 'You must provide a command to run');

const {pattern} = argv;
const cmd = argv._[0];
const args = argv._.slice(1);
const opts = argv;

// Delete non gazer options
delete opts.pattern;
delete opts.v;
delete opts.p;
delete opts._;
delete opts.$0;

gazer([].concat(pattern), cmd, args, opts);
