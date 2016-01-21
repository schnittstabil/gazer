'use strict';
var path = require('path');

var gaze = require('gaze');
var npmlog = require('npmlog');

var Runner = require('./runner');

module.exports = function (patterns, cmd, args, opts) {
	opts = opts || {};
	var runner = new Runner(cmd, args, opts);

	gaze(patterns, opts, function (err) {
		if (err) {
			throw new Error(err);
		}

		var fileCount = Object.keys(this.watched()).length;

		npmlog.info('gazer-color', 'Watching %d file[s] (%s)', fileCount, patterns.join(', '));

		this.on('all', function (event, filepath) {
			filepath = path.relative(process.cwd(), filepath);
			npmlog.info('gazer-color', '`%s` %s', filepath, event);
			runner.run();
		});
	});
};
