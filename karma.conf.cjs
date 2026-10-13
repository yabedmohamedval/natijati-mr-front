module.exports = config => config.set({
  frameworks: ['jasmine'],
  plugins: [require('karma-jasmine'), require('karma-chrome-launcher'), require('karma-coverage')],
  reporters: ['progress'],
  browsers: ['ChromeHeadless'],
  coverageReporter: {
    dir: require('node:path').join(__dirname, 'coverage'),
    subdir: '.',
    reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'json-summary' }]
  },
  restartOnFileChange: true
});
