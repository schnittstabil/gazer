import childProcess from 'child_process';

import test from 'ava';

const {exec} = childProcess;
const CLI = './cli.js';

class Listener {
	constructor(file, waitUntil) {
		this.capture = {stderr: '', stdout: ''};
		this.file = file;
		this.waitUntil = waitUntil;
		this.waitUntilTimer = null;
		this.echoTimer = null;
	}

	spawnCli(...args) {
		return new Promise((resolve, reject) => {
			this.child = childProcess.spawn('node', [CLI].concat(args));
			this.child.stderr.on('data', this.listen.bind(this, 'stderr'));
			this.child.stdout.on('data', this.listen.bind(this, 'stdout'));
			this.child.on('close', () => {
				this.cleanUp();
				resolve(this);
			});
			this.child.on('exit', () => {
				this.cleanUp();
				resolve(this);
			});
			this.child.on('error', err => {
				this.cleanUp();
				reject(err);
			});
			this.child.on('error', err => reject(err));
		});
	}

	cleanUp() {
		for (const timer of [this.echoTimer, this.waitUntilTimer]) {
			if (timer) {
				clearInterval(timer);
			}
		}
	}

	listen(stream, data) {
		this.capture[stream] += String(data);
		if (this.waitUntilTimer) {
			return;
		}
		this.waitUntilTimer = setInterval(() => this.wait(), 100);
		this.echoTimer = setInterval(() => this.echo(), 1000);
	}

	wait() {
		if (!this.child.killed && this.waitUntil(this)) {
			process.nextTick(() => this.child.kill('SIGKILL'));
		}
	}

	echo() {
		process.nextTick(() => exec(`echo "* { color: black }" >> ${this.file}`));
	}
}

test('watch files and run a command', async t => {
	const listener = new Listener('fixtures/foo.less', self => /^blorp$/m.test(self.capture.stdout));

	await listener.spawnCli('--pattern', 'fixtures/*.less', '--', 'echo', 'blorp');

	t.is(listener.capture.stdout.trim(), 'blorp');
});

test('output exit code in verbose mode', async t => {
	const listener = new Listener('fixtures/foo.sass', self => /exited/m.test(self.capture.stderr));

	await listener.spawnCli('-v', '--pattern', 'fixtures/*.sass', '--', 'echo', 'blorp');

	const stderr = listener.capture.stderr.trim();
	t.regex(stderr, /exited with code 0$/m);
});

test('handle mixed quotations of diffrent types correctly', async t => {
	const listener = new Listener('fixtures/foo.css', self => /^blorp$/m.test(self.capture.stdout));

	await listener.spawnCli('--pattern', 'fixtures/*.css', '--', 'node', '-e', 'console.log(\'blorp\');');

	t.is(listener.capture.stdout.trim(), 'blorp');
});
