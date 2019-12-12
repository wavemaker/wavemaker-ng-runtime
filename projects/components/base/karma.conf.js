// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    files: [
        '../../../node_modules/jquery/dist/jquery.min.js',
        '../../../node_modules/lodash/lodash.min.js',
        '../../../node_modules/moment/min/moment.min.js',
        '../../../node_modules/summernote/dist/summernote-lite.js',
        "../../../node_modules/jquery-ui/ui/disable-selection.js",
        "../../../node_modules/jquery-ui/ui/version.js",
        "../../../node_modules/jquery-ui/ui/widget.js",
        "../../../node_modules/jquery-ui/ui/scroll-parent.js",
        "../../../node_modules/jquery-ui/ui/plugin.js",
        "../../../node_modules/jquery-ui/ui/data.js",
        "../../../node_modules/jquery-ui/ui/widgets/mouse.js",
        "../../../node_modules/jquery-ui/ui/widgets/resizable.js",
        "../../../node_modules/jquery-ui/ui/widgets/sortable.js",
        "../../../node_modules/jquery-ui/ui/widgets/droppable.js",
        '../widgets/data/table/src/datatable.js',
        '../../../libraries/swipey/bundles/index.umd.js',
        '../../../../wavemaker-app-runtime-angularjs/application/styles/css/wm-style.css',
        '../../../../wavemaker-artifacts/default/themes/material/style.css'
    ],
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-mocha-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../coverage/components'),
      reports: ['json'],// ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
      combineBrowserReports: true,
      skipFilesWithNoCoverage: true
    },
    reporters: ['progress', 'mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    restartOnFileChange: true
  });
};
