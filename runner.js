'use strict';
var spawn = require('child_process').spawn;

var debounce = require('lodash.debounce');
var npmlog = require('npmlog');

function sanitizeSpawnArgs(cmd, args) {
  var spawnOpts = { stdio: 'inherit' };

  if (process.platform === 'win32') {
    args = ['/c', '"' + cmd + '"'].concat(args)
    cmd = 'cmd'
    spawnOpts.windowsVerbatimArguments = true
  }

  return [cmd, args, spawnOpts];
}

function Runner(cmd, args, opts) {
  var wait = 100; // debounce: the number of milliseconds to delay
  var spawnArgs = sanitizeSpawnArgs(cmd, args);
  var spawnArgsLogString = [spawnArgs[0]].concat(spawnArgs[1]).join(' ');

  opts = opts || {};

  this.spawn = function() {
    npmlog.info('gazer-color', 'Running `%s`', spawnArgsLogString);
    spawn.apply(null, spawnArgs);
  }

  this.run = debounce(this.spawn, wait);
}

module.exports = Runner;
