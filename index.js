'use strict';
const path = require('path');

const gaze = require('gaze');
const npmlog = require('npmlog');

const Runner = require('./runner');

module.exports = function (patterns, cmd, args, opts) {
	opts = opts || {};
	const runner = new Runner(cmd, args, opts);

	gaze(patterns, opts, function (err) {
		if (err) {
			throw new Error(err);
		}

		const fileCount = Object.keys(this.watched()).length;

		npmlog.info('gazer-color', 'Watching %d file[s] (%s)', fileCount, patterns.join(', '));

		this.on('all', (event, filepath) => {
			filepath = path.relative(process.cwd(), filepath);
			npmlog.info('gazer-color', '`%s` %s', filepath, event);
			runner.run();
		});
	});
};
