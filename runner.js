'use strict';
const {spawn} = require('child_process');

const debounce = require('lodash.debounce');
const npmlog = require('npmlog');

function sanitizeSpawnArgs(cmd, args) {
	const spawnOpts = {stdio: 'inherit'};

	if (process.platform === 'win32') {
		args = ['/c', '"' + cmd + '"'].concat(args);
		cmd = 'cmd';
		spawnOpts.windowsVerbatimArguments = true;
	}

	return [cmd, args, spawnOpts];
}

function Runner(cmd, args, opts) {
	const wait = 100; // Debounce: the number of milliseconds to delay
	const spawnArgs = sanitizeSpawnArgs(cmd, args);
	const spawnArgsLogString = [spawnArgs[0]].concat(spawnArgs[1]).join(' ');

	opts = opts || {};

	this.spawn = function () {
		npmlog.info('gazer-color', 'Running `%s`', spawnArgsLogString);

		const child = spawn(...spawnArgs);

		if (opts.verbose) {
			child.on('close', code => {
				npmlog.info('gazer-color', '`%s` exited with code %d', spawnArgsLogString, code);
			});
		}
	};

	this.run = debounce(this.spawn, wait);
}

module.exports = Runner;
