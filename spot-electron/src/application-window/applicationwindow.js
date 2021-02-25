const {
    BrowserWindow
} = require('electron');
const isDev = require('electron-is-dev');
const { OnlineDetector } = require('../online-detector');
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
    const onlineDetector = new OnlineDetector();

    let showCrashPageTimeout = null;

    applicationWindow = new BrowserWindow({
        // By default the application should always run in kiosk mode.
        kiosk: !isDev,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Set event handlers
    onlineDetector.addListener(OnlineDetector.ONLINE_STATUS_CHANGED, isOnline => {
        clearTimeout(showCrashPageTimeout);

        if (isOnline) {
            applicationWindow.loadURL(defaultSpotURL);
        } else {
            applicationWindow.loadFile('src/static/offline.html');
        }
    });

    const loadCrashedPage = () => {
        // The setTimeout 0 is necessary clear the current stack or else
        // navigation will cause the main app to crash as well.
        setTimeout(() => {
            applicationWindow.loadFile('src/static/crashed.html')
                .then(() => {
                    showCrashPageTimeout = setTimeout(
                        () => applicationWindow.loadURL(defaultSpotURL),
                        5000
                    );
                });
        });
    };

    applicationWindow.webContents.on('crashed', () => {
        if (!onlineDetector.getLastOnlineStatus()) {
            return;
        }

        loadCrashedPage();
    });

    applicationWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        logger.error('Failed to load', {
            errorCode,
            errorDescription
        });

        if (!onlineDetector.getLastOnlineStatus()) {
            return;
        }

        loadCrashedPage();
    });

    applicationWindow.on('closed', () => {
        onlineDetector.destroy();
    });

    applicationWindow.webContents.setUserAgent(
        `${applicationWindow.webContents.getUserAgent()} ${SPOT_ELECTRON_FEATURE_VERSION}`
    );

    applicationWindow.loadURL(defaultSpotURL);

    onlineDetector.start();
    logger.info(`Spot started with Spot-TV URL ${defaultSpotURL}`);
}

module.exports = {
    createApplicationWindow
};
