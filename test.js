var assert = require('assert');
var childProcess = require('child_process');
var exec = childProcess.exec;
var spawn = childProcess.spawn;
var CLI = './cli.js';

function Listener(cmd, args, onClose) {
  this.capture = {
    stderr: '',
    stdout: '',
  };
  this.state = '';
  this.sut = spawn(cmd, args);
  this.sut.stderr.on('data', this.listen.bind(this, 'stderr'));
  this.sut.stdout.on('data', this.listen.bind(this, 'stdout'));
  this.sut.on('close', onClose.bind(this));
}

Listener.prototype.listen = function(stream, data) {
  this.capture[stream] += String(data);
  if (this.state === '') {
    if (/Watching/.test(this.capture.stderr)) {
      this.state = 'Watching';
      if (this.onWatching) {
        this.onWatching();
      }
    }
  }
  if(this.state === 'Watching') {
    if (/Running/.test(this.capture.stderr)) {
      this.state = 'Running';
    }
  }
  if (this.state === 'Running' && this.onRunning) {
    this.onRunning();
  }
}

describe('gazer-color', function() {

  it('should watch files and run a command', function(done) {
    var listener = new Listener('node',
      [CLI, '--pattern', 'fixtures/*.less', '--', 'echo', 'blorp'],
      function() {
        assert.strictEqual(this.capture.stdout.trim(), 'blorp');
        assert.strictEqual(this.state, 'Closing');
        done();
      }
    );
    listener.onWatching = function() {
      process.nextTick(function() {
        exec('echo "* { color: black }" > fixtures/foo.less');
      });
    }
    listener.onRunning = function() {
      if (/^blorp$/m.test(this.capture.stdout)) {
        this.state = 'Closing';
        this.sut.kill();
      }
    }
  });

  it('should output exit code in verbose mode', function(done) {
    var listener = new Listener('node',
      [CLI, '-v', '--pattern', 'fixtures/*.less', '--', 'echo', 'blorp'],
      function() {
        assert.ok(/exited with code 0$/m.exec(this.capture.stderr.trim()));
        assert.strictEqual(this.state, 'Closing');
        done();
      }
    );
    listener.onWatching = function() {
      process.nextTick(function() {
        exec('echo "* { color: black }" > fixtures/foo.less');
      });
    }
    listener.onRunning = function() {
      if (/exited/m.test(this.capture.stderr)) {
        this.state = 'Closing';
        listener.sut.kill();
      }
    }
  });

  it('should handle mixed quotations of diffrent types correctly', function(done) {
    var listener = new Listener('node',
      [CLI, '--pattern', 'fixtures/*.less', '--', 'node', '-e', 'console.log(\'blorp\');'],
      function() {
        assert.strictEqual(this.capture.stdout.trim(), 'blorp');
        assert.strictEqual(this.state, 'Closing');
        done();
      }
    );
    listener.onWatching = function() {
      process.nextTick(function() {
        exec('echo "* { color: black }" > fixtures/foo.less');
      });
    }
    listener.onRunning = function() {
      if (/^blorp$/m.test(this.capture.stdout)) {
        this.state = 'Closing';
        this.sut.kill();
      }
    }
  });
});
