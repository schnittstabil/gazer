# A Gazer fork capable of color output

> Watch some files, do a thing

A simple wrapper for [Shama's gaze
module](https://github.com/shama/gaze) that performs an arbitrary
command when files change. Like
[watchify](https://github.com/substack/watchify), but for everything.

## Installation

```shell
$ npm install --save-dev gazer-color
# or
$ npm install -g gazer-color
```

## Usage

```shell
$ gazer-color --pattern README.md -- echo blorp
# note the -- between the gazer-color arguments like --patern and the command and its arguments

[README.md changes]

> blorp
```

### Multiple patterns

[gaze](https://github.com/shama/gaze#usage) accepts an array of patterns, so do `gazer-color`.

```javascript
gaze(['**/*.js', '!node_modules/**/*'], function() {
  console.log('blorp');
});
```

```shell
$ gazer-color --pattern '**/*.js' --pattern '!node_modules/**/*' -- echo blorp

[index.js changes]

> blorp
```

### Arbitrary watch tasks with npm run

If you haven't read substack's [post describing lightweight build steps
with `npm run`](http://substack.net/task_automation_with_npm_run), I'll
give you a moment to get up to speed.

Here's how you might use `gazer-color` to run a build task every time a file
changes:

```javascript
{
  "scripts": {
    "test": "mocha",
    "watch-test": "gazer-color -p \"public/less/**/*.less\" -- npm run test"
  }
}
```

And then start the watcher:

```shell
$ npm run watch-less
```
