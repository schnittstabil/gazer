var spawn = require('child_process').spawn;
var gaze = require('gaze');
var debounce = require('lodash.debounce');

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

    console.log('Watching "'+ pattern +'" : ' +
                fileCount +' file'+ (fileCount > 1 ? 's' : ''));

    this.on('all', debounce(function runner(event, filepath) {
      console.log('Running: '+ cmd + ' ' + args.join(' '));
      spawn(cmd, args, spawnOpts);
    }, 100));
  });
};

