// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'), // Make sure chrome launcher is included
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/your-project-name'), // Adjust project name if needed
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876, // From second config
    colors: true, // From second config
    logLevel: config.LOG_INFO, // From second config
    autoWatch: true, // From second config

    // ** Custom Browser Configuration from second config **
    customLaunchers: {
      ChromeCustom: {
        base: 'Chrome',
        flags: ['--no-sandbox', '--disable-gpu']
      },
      // Optional: If you prefer headless
      ChromeHeadlessCustom: {
         base: 'ChromeHeadless',
         flags: ['--no-sandbox', '--disable-gpu']
      }
    },
    browsers: ['ChromeHeadlessCustom'], // Using the headless custom launcher from second config

    // ** END Custom Browser Configuration **

    singleRun: false, // From second config (Set to true for CI)
    restartOnFileChange: true, // Present in both, kept once

    // ** Webpack Configuration from first config **
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true
                }
              }
            ]
          }
        ]
      },
      resolve: {
        extensions: ['.ts', '.js']
      }
    }
    // ** END Webpack Configuration **
  });
};
