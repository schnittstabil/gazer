var assert = require('assert');
var childProcess = require('child_process');
var exec = childProcess.exec;
var spawn = childProcess.spawn;
var CLI = './bin/cmd.js';

describe('gazer-color', function() {

  it('should watch files and run a command', function(done) {
    var PATTERN = 'example/*.less';
    var stdout = '';
    var stderr = '';
    var sut = spawn('node', [CLI, '--pattern', PATTERN, '--', 'echo', 'blorp']);
    var state = '';
    sut.stderr.on('data', function(data) {
      stderr += String(data);
    });
    sut.stdout.on('data', function(data) {
      stdout += String(data);
      switch(state) {
      case '':
        if (/Watching/.test(stdout)) {
          state = 'Watching';
          process.nextTick(function() {
            exec('echo "* { color: black }" > example/foo.less');
          });
        }
      case 'Watching':
        if (/Running/.test(stdout)) {
          state = 'Running';
        }
      case 'Running':
        if (/echo blorp[^]*blorp/.test(stdout)) {
          state = 'DONE';
          sut.kill();
        }
      }
    });
    sut.on('close', function() {
      assert.strictEqual(stderr, '');
      assert.strictEqual(state, 'DONE');
      done();
    });
  });

  it('should handle mixed quotations of diffrent types correctly', function(done) {
    var PATTERN = 'example/*.less';
    var state = ''
    var stdout = '';
    var stderr = '';
    var sut = spawn('node', [CLI, '--pattern', PATTERN, '--', 'node', '-e', 'console.log("blorp");']);
    sut.stderr.on('data', function(data) {
      stderr += String(data);
    });
    sut.stdout.on('data', function(data) {
      stdout += String(data);
      switch(state) {
      case '':
        if (/Watching/.test(stdout)) {
          state = 'Watching';
          process.nextTick(function() {
            exec('echo "* { color: black }" > example/foo.less');
          });
        }
      case 'Watching':
        if (/Running/.test(stdout)) {
          state = 'Running';
        }
      case 'Running':
        if (/blorp[^]*blorp/.test(stdout)) {
          state = 'DONE';
          sut.kill('SIGTERM');
        }
      }
    });
    sut.on('close', function() {
      assert.strictEqual(stderr, '');
      assert.strictEqual(state, 'DONE');
      done();
    });
  });
});
