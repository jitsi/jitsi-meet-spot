/* global __dirname */

const path = require('path');
const { TimelineService } = require('wdio-timeline-reporter/timeline-service');
const video = require('wdio-video-reporter');

const constants = require('./constants');
const screenInfo = require('./screen-info');

const DESKTOP_SOURCE_NAME
    = screenInfo.getScreenCount() > 1 ? 'Screen 1' : 'Entire screen';
const LOG_LEVEL = process.env.LOG_LEVEL || 'warn';
const PATH_TO_FAKE_VIDEO
    = path.resolve(__dirname, 'resources', constants.FAKE_SCREENSHARE_FILE_NAME);

const spotSessionStore = require('./user/spotSessionStore');

exports.config = {
    // How many fails should trigger stopping the tests. Zero skips stopping.
    bail: 0,

    // Use multi-remote support for one Spot-TV and one Spot-Remote.
    capabilities: {
        spotBrowser: {
            capabilities: {
                browserName: 'chrome',
                'goog:chromeOptions': {
                    args: [
                        'use-fake-device-for-media-stream',
                        'use-fake-ui-for-media-stream',
                        `use-file-for-fake-video-capture=${PATH_TO_FAKE_VIDEO}`
                    ]
                }
            }
        },
        remoteControlBrowser: {
            capabilities: {
                browserName: 'chrome',
                'goog:chromeOptions': {
                    args: [
                        `auto-select-desktop-capture-source=${DESKTOP_SOURCE_NAME}`
                    ]
                }
            }
        }
    },

    framework: 'jasmine',

    jasmineNodeOpts: {

        // When running tests against the backend integration, Spot-TVs might
        // encounter JID conflicts while loading the app, so give ample time to
        // recover from them.
        defaultTimeoutInterval: constants.MAX_PAGE_LOAD_WAIT + 30000
    },

    logLevel: LOG_LEVEL,

    maxInstances: process.env.MAX_INSTANCES || 1,

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
        ],
        [
            video,
            {
                outputDir: './webdriver-results'
            }
        ],
    ],

    // Use selenium-standalone to automatically download and launch selenium.
    services: [
        'selenium-standalone',
        [ TimelineService ]
    ],

    specs: [
        path.resolve(__dirname, 'specs', '**/*.spec.js')
    ],

    afterTest: () => {
        spotSessionStore.clearSessions();
    },

    // Default wait time for all webdriverio wait-related functions.
    waitforTimeout: 10000
};
