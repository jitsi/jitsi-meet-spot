/* global __dirname */

const path = require('path');

const CHROMEDRIVER_SHUTDOWN_WAIT = 1000;

exports.config = {
    /**
     * Waits momentarily to give wdio-selenium-standalone time to close down
     * webdriver sessions. This is a workaround chromedriver instances not
     * being terminated.
     */
    after() {
        browser.pause(CHROMEDRIVER_SHUTDOWN_WAIT);
    },

    /**
     * Ends the current webdriver session and closes all browsers. This method
     * is normally called immediately after webdriver.io has closed the session,
     * but wdio-selenium-standalone  can fail to shut down chromedriver and
     * calling close again is a workaround. The async/await declaration is
     * necessary in the context of this method call.
     */
    async afterSession() {
        await browser.end().pause(CHROMEDRIVER_SHUTDOWN_WAIT);
    },

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
