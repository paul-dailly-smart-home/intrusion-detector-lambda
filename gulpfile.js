var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
const TEST_REPORT_FORMAT = process.env.TEST_REPORT_FORMAT == 'junitXml' ? 'junitXml' : 'html';
const TEST_REPORT_DIR = process.env.TEST_REPORT_DIR || 'build/reports/unit-test';
const TEST_REPORTERS = {
  junitXml: {
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
      mochaFile: TEST_REPORT_DIR
    }
  },
  html: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: TEST_REPORT_DIR,
      reportName: 'unit-test-report'
    }
  }
};

var _getReporterConfig = () => TEST_REPORTERS[TEST_REPORT_FORMAT];

gulp.task('test', function (cb) {
  gulp.src(['./src/**/*.js', '!./src/**/*.spec.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['./src/**/*.spec.js'])
        .pipe(mocha(
          _getReporterConfig()
        ))
        .pipe(istanbul.writeReports({dir: 'build/coverage/unit-test'}))
        .pipe(istanbul.enforceThresholds({thresholds: {global: 90}}))
        .on('end', cb);
    });
});