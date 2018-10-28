import childProcess from 'child_process';

import test from 'ava';

const {exec} = childProcess;
const CLI = './cli.js';

function Listener() {
	this.capture = {stderr: '', stdout: ''};
	this.state = '';
}

Listener.prototype.spawnCli = function (...args) {
	return new Promise((resolve, reject) => {
		this.sut = childProcess.spawn('node', [CLI].concat(args));
		this.sut.stderr.on('data', this.listen.bind(this, 'stderr'));
		this.sut.stdout.on('data', this.listen.bind(this, 'stdout'));
		this.sut.on('close', resolve.bind(resolve, this));
		this.sut.on('exit', resolve.bind(resolve, this));
		this.sut.on('error', err => reject(err));
	});
};

Listener.prototype.listen = function (stream, data) {
	this.capture[stream] += String(data);
	if (this.state === '') {
		if (/Watching/.test(this.capture.stderr)) {
			this.state = 'Watching';
			this.onWatching();
		}
	}
	if (this.state === 'Watching') {
		if (/Running/.test(this.capture.stderr)) {
			this.state = 'Running';
		}
	}
	if (this.state === 'Running') {
		this.onRunning();
	}
};

Listener.prototype.close = function () {
	this.state = 'Closing';
	this.sut.kill('SIGKILL');
};

Listener.prototype.onWatching = () => {
	process.nextTick(exec.bind(null, 'echo "* { color: black }" > fixtures/foo.less'));
};

test('watch files and run a command', async t => {
	const listener = new Listener();

	listener.onRunning = function () {
		if (this.capture.stdout.trim() === 'blorp') {
			this.close();
		}
	};

	await listener.spawnCli('--pattern', 'fixtures/*.less', '--', 'echo', 'blorp');

	t.is(listener.capture.stdout.trim(), 'blorp');
	t.is(listener.state, 'Closing');
});

test('output exit code in verbose mode', async t => {
	const listener = new Listener();

	listener.onRunning = function () {
		if (/exited/m.test(this.capture.stderr)) {
			this.close();
		}
	};

	await listener.spawnCli('-v', '--pattern', 'fixtures/*.less', '--', 'echo', 'blorp');

	const stderr = listener.capture.stderr.trim();
	t.regex(stderr, /exited with code 0$/m);
	t.is(listener.state, 'Closing');
});

test('handle mixed quotations of diffrent types correctly', async t => {
	const listener = new Listener();

	listener.onRunning = function () {
		if (this.capture.stdout.trim() === 'blorp') {
			this.close();
		}
	};

	await listener.spawnCli('--pattern', 'fixtures/*.less', '--', 'node', '-e', 'console.log(\'blorp\');');

	t.is(listener.capture.stdout.trim(), 'blorp');
	t.is(listener.state, 'Closing');
});
