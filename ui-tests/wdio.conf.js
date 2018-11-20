/* global __dirname */

const path = require('path');

exports.config = {
    capabilities: [
        {
            browserName: 'chrome',
            chromeOptions: {
                args: [
                    'use-fake-device-for-media-stream',
                    'use-fake-ui-for-media-stream'
                ]
            }
        }
    ],
    framework: 'jasmine',
    services: [ 'selenium-standalone' ],
    specs: [ path.resolve(__dirname, 'specs/*.spec.js') ]
};
