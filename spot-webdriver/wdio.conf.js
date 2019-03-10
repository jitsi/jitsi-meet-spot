/* global __dirname */

const path = require('path');

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
                        'use-fake-ui-for-media-stream'
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

    logLevel: 'info',

    reporters: [ 'dot' ],

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
