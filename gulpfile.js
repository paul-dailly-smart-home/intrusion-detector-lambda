var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('test', function (cb) {
  gulp.src(['./src/**/*.js', '!./src/**/*.spec.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['./src/**/*.spec.js'])
        .pipe(mocha({
          reporter: 'mochawesome', reporterOptions: {
            reportDir: 'build/reports/unit-test',
            reportName: 'unit-test-report'
          }
        }))
        .pipe(istanbul.writeReports({dir: 'build/coverage/unit-test'}))
        .pipe(istanbul.enforceThresholds({thresholds: {global: 90}}))
        .on('end', cb);
    });
});