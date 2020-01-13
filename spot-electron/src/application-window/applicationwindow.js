const {
    BrowserWindow
} = require('electron');
const isDev = require('electron-is-dev');

const { defaultSpotURL } = require('../../config');

const { logger } = require('../logger');

/**
 * The constant is included into the user agent part to allow feature detection in future.
 *
 * @type {string}
 */
const SPOT_ELECTRON_FEATURE_VERSION = 'SpotElectron/1';

/**
 * This is the reference for the main window. May be exposed from this scope later, but we don't have
 * any reasons to do it yet.
 */
let applicationWindow;

/**
 * Function to create the main window (application window).
 *
 * @returns {void}
 */
function createApplicationWindow() {
    applicationWindow = new BrowserWindow({
        // By default the application should always run in kiosk mode.
        kiosk: !isDev,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Set event handlers
    applicationWindow.webContents.on('crashed', () => {
        // The setTimeout 0 is necessary clear the current stack or else
        // navigation will cause the main app to crash as well.
        setTimeout(() => {
            applicationWindow.loadFile('src/static/crashed.html')
                .then(() => {
                    setTimeout(() => {
                        applicationWindow.loadURL(defaultSpotURL);
                    }, 5000);
                });
        });
    });

    applicationWindow.loadURL(defaultSpotURL, {
        userAgent: `${applicationWindow.webContents.getUserAgent()} ${SPOT_ELECTRON_FEATURE_VERSION}`
    });

    logger.info(`Spot started with Spot-TV URL ${defaultSpotURL}`);
}

module.exports = {
    createApplicationWindow
};
