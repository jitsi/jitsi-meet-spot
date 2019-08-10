/* global __dirname */

const path = require('path');

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
        defaultTimeoutInterval: 90000
    },

    logLevel: LOG_LEVEL,

    maxInstances: process.env.MAX_INSTANCES || 1,

    reporters: [ 'spec' ],

    // Use selenium-standalone to automatically download and launch selenium.
    services: [ 'selenium-standalone' ],

    specs: [
        path.resolve(__dirname, 'specs', '**/*.spec.js')
    ],

    afterTest: () => {
        spotSessionStore.clearSessions();
    },

    // Default wait time for all webdriverio wait-related functions.
    waitforTimeout: 10000
};
