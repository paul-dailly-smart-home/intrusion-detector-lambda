var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var env = require('gulp-env');

gulp.task('set-test-env', function () {
    env({
        vars: {
            DYNAMODB_PORT: 5688,
            DYNAMODB_HOST: 'http://localhost'
        }
    });
});

gulp.task('test', ['set-test-env'], function (cb) {
  gulp.src(['./src/**/*.js', '!./src/test/**'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['./src/test/**/*.spec.js'])
        .pipe(mocha({
          reporter: 'mochawesome', reporterOptions: {
            reportDir: 'build/reports/unit-test',
            reportName: 'unit-test-report'
          }
        }))
        .pipe(istanbul.writeReports({dir: 'build/coverage/unit-test'}))
        .pipe(istanbul.enforceThresholds({thresholds: {global: 10}}))
        .on('end', cb);
    });
});