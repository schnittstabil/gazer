var spawn = require('child_process').spawn;
var gaze = require('gaze');
var debounce = require('lodash.debounce');

module.exports = function(pattern, cmd, args){
  var opts = { stdio: 'inherit' };
  if (process.platform === 'win32') {
    args = ['/c', '"' + cmd + '"'].concat(args)
    cmd = 'cmd'
    opts.windowsVerbatimArguments = true
  }

  function runner(event, filepath){
    console.log('Running: '+ cmd + ' ' + args.join(' '));
    spawn(cmd, args, opts);
  }

  gaze(pattern, function(err, watcher){
    if (err) {
      throw new Error(err);
    }

    var fileCount = Object.keys(this.watched()).length;

    console.log('Watching "'+ pattern +'" : ' +
                fileCount +' file'+ (fileCount > 1 ? 's' : ''));

    this.on('all', debounce(runner, 100));
  });
};

