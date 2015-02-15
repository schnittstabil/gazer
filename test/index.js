var assert = require('chai').assert;
var exec = require('child_process').exec;

describe('gazer', function(){

  var pattern = 'example/*.less';
  var compile = './node_modules/.bin/lessc --verbose example/foo.less example/foo.css';

  it('should watch files and run a command', function(done){
    var cmd = ['./bin/cmd.js --pattern', pattern, '--', compile];
    var child = exec(cmd.join(' '), function(err, stdout, stderr){
      if (err) {
        assert.ok(false, err);
        done();
      }
    });

    child.stdout.on('data', function(data){
      if (/Watching/.test(data)) {
        assert.equal(data.trim(), 'Watching "example/foo.less" : 1 file');
        process.nextTick(function(){
          exec('echo "* { color: black }" > example/foo.less');
        });
      }

      if (/^lessc/.test(data)) {
        assert.include(data, 'lessc: wrote');
        done();
      }
    });
  });

  it('should handle mixed quotations of diffrent types correctly', function(done) {
    var cmd = './bin/cmd.js -p example/foo.less -- node -e \'console.log("blorp");\'';
    var child = exec(cmd, function(err, stdout, stderr){
      if (err) {
        assert.notOk(err, err);
        done();
      }
    });

    child.stdout.on('data', function(data){
      if (/Watching/.test(data)) {
        process.nextTick(function(){
          exec('echo "* { color: black }" > example/foo.less');
        });
      }

      if (/^blorp\n/.test(data)) {
        done();
      }
    });
  });
});
