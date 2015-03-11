var spawn = require('child_process').spawn;
var gaze = require('gaze');
var debounce = require('lodash.debounce');
var path = require('path');
var log = require('npmlog');

module.exports = function(pattern, cmd, args, opts) {
  opts = opts || {};
  var spawnOpts = { stdio: 'inherit' };
  if (process.platform === 'win32') {
    args = ['/c', '"' + cmd + '"'].concat(args)
    cmd = 'cmd'
    spawnOpts.windowsVerbatimArguments = true
  }

  gaze(pattern, opts, function(err, watcher) {
    if (err) {
      throw new Error(err);
    }

    var fileCount = Object.keys(this.watched()).length;

    log.info('gazer-color', 'Watching "'+ pattern +'" : ' +
                fileCount +' file'+ (fileCount > 1 ? 's' : ''));

    this.on('all', debounce(function runner(event, filepath) {
      filepath = path.relative(process.cwd(), filepath);
      log.info('gazer-color', filepath + ' ' + event);
      log.info('gazer-color', 'Running: '+ cmd + ' ' + args.join(' '));
      spawn(cmd, args, spawnOpts);
    }, 100));
  });
};

