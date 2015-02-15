var spawn = require('child_process').spawn;
var gaze = require('gaze');
var debounce = require('lodash.debounce');

module.exports = function(pattern, cmd, args){
  function runner(event, filepath){
    console.log('Running: '+ cmd + ' ' + args.join(' '));
    spawn(cmd, args, { stdio: 'inherit' });
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

