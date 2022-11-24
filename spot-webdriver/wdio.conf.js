const path = require('path');
const { TimelineService } = require('wdio-timeline-reporter/timeline-service');

const constants = require('./constants');
const screenInfo = require('./screen-info');


const DESKTOP_SOURCE_NAME
    = screenInfo.getScreenCount() > 1 ? 'Screen 1' : 'Entire screen';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const PATH_TO_FAKE_VIDEO
    = path.resolve(__dirname, 'resources', constants.FAKE_SCREENSHARE_FILE_NAME);

exports.config = {
    specs: [
        path.resolve(__dirname, 'specs', '**/*.spec.js')
    ],

    exclude: [

        // 'path/to/excluded/files'
    ],

    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    // 10?
    maxInstances: process.env.MAX_INSTANCES || 1,
    capabilities: {
        spotBrowser: {
            capabilities: {
                browserName: 'chrome',
                'goog:chromeOptions': {
                    args: [
                        'use-fake-device-for-media-stream',
                        'use-fake-ui-for-media-stream',
                        `use-file-for-fake-video-capture=${PATH_TO_FAKE_VIDEO}`,
                        '--ignore-certificate-errors'
                    ]
                }
            }
        },
        remoteControlBrowser: {
            capabilities: {
                browserName: 'chrome',
                'goog:chromeOptions': {
                    args: [
                        `auto-select-desktop-capture-source=${DESKTOP_SOURCE_NAME}`,
                        '--ignore-certificate-errors'
                    ]
                }
            }
        }
    },

    logLevel: LOG_LEVEL,

    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,

    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'http://localhost:8000',

    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,

    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 120000,

    // Default request retries count
    connectionRetryCount: 3,

    services: [
        [
            'chromedriver',
            {
                logFileName: 'wdio-chromedriver.log', // default
                outputDir: 'driver-logs', // overwrites the config.outputDir
                args: [ '--silent' ],

                // localhost run: force use chrome driver 105 from a different folder as the one from "Applications" gets updated automatically by company rules; latest chromedriver 106, 107 have an issue
                // chromedriverCustomPath: '/Users/bduduman/Downloads/chromedriver',
            }
        ],
        [ TimelineService ] ],

    framework: 'jasmine',

    reporters: [
        [
            'junit',
            {
                outputDir: './webdriver-results'
            }
        ],
        'spec',
        [
            'timeline',
            {
                embedImages: true,
                outputDir: './webdriver-results',
                screenshotStrategy: 'before:click'
            }
        ]
    ],

    jasmineOpts: {
        // When running tests against the backend integration, Spot-TVs might
        // encounter JID conflicts while loading the app, so give ample time to
        // recover from them.
        defaultTimeoutInterval: constants.MAX_PAGE_LOAD_WAIT + 30000
    }
};
