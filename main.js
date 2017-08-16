const electron = require('electron');
const path = require('path');
const url = require('url');

const APP = electron.app;
const BrowserWindow = electron.BrowserWindow;

/**
 * URL for index.html which will be our entry point.
 */
const indexURL = url.format({
    pathname: path.join(__dirname, 'windows', 'jitsi-meet', 'index.html'),
    protocol: 'file:',
    slashes: true
});

/**
 * The window object that will load the iframe with Jitsi Meet.
 * IMPORTANT: Must be defined as global in order to not be garbage collected
 * acidentally.
 */
let jitsiMeetWindow = null;

/**
 * Options used when creating the main Jitsi Meet window.
 */
const jitsiMeetWindowOptions = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden'
};

/**
 * Sets the APP object listeners.
 * 
 * @returns {null}
 */
function setAPPListeners() {
    APP.on('ready', createJitsiIframe);
    APP.on('activate', () => {
        if (jitsiMeetWindow === null) {
            createJitsiIframe();
        }
    });
    APP.on('window-all-closed', () => {
        // Don"t quit the application for Mac OS
        if (process.platform !== 'darwin') {
            APP.quit();
        }
    });
}

/**
 * Creates a BrowserWindow to contain jitsi-meet.
 * 
 * @returns {null}
 */
function createJitsiIframe() {
    jitsiMeetWindow = new BrowserWindow(jitsiMeetWindowOptions);
    jitsiMeetWindow.loadURL(indexURL);
}

// Start the application:
setAPPListeners();

