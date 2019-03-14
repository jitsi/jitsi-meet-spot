/* global __dirname */

const path = require('path');

const LOG_LEVEL = process.env.LOG_LEVEL || 'warn';
const PATH_TO_FAKE_VIDEO
    = path.resolve(__dirname, 'resources/static-image.y4m');

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
                browserName: 'chrome'
            }
        }
    },

    framework: 'jasmine',

    logLevel: LOG_LEVEL,

    reporters: [ 'spec' ],

    // Use selenium-standalone to automatically download and launch selenium.
    services: [ 'selenium-standalone' ],

    specs: [ path.resolve(__dirname, 'specs/*.spec.js') ],

    // Default wait time for all webdriverio wait-related functions.
    waitforTimeout: 10000,

    // Workaround for chrome and chromedriver instances not getting cleaned up
    // automatically.
    after: () => {
        browser.deleteSession();
    }
};
