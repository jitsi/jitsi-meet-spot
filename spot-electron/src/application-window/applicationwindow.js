const {
    BrowserWindow
} = require('electron');
const process = require('process');

const {
    defaultSpotURL,
    spashScreen
} = require('../../config');

const { config } = require('../config');
const { logger } = require('../logger');

/**
 * This is the reference for the main window. May be exposed from this scope later, but we don't have
 * any reasons to do it yet.
 */
let applicationWindow;

/**
 * Reference to the splash window. This can be disabled in the config.
 */
let splashWindow;

/**
 * Function to create the main window (application window).
 *
 * @returns {void}
 */
function createApplicationWindow() {
    const startFullScreen = config.getValue('window.fullscreen');

    applicationWindow = new BrowserWindow({
        fullscreen: startFullScreen,
        height: config.getValue('window.height'),
        show: false,
        titleBarStyle: 'hidden',
        width: config.getValue('window.width'),
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (spashScreen && !startFullScreen) {
        splashWindow = new BrowserWindow({
            frame: false,
            height: spashScreen.height,
            maximizable: false,
            parent: applicationWindow,
            resizable: false,
            width: spashScreen.width
        });

        splashWindow.loadFile(spashScreen.logo);
    }

    // Set event handlers
    applicationWindow.once('ready-to-show', _onWindowReady);
    applicationWindow.on('resize', _onWindowResize);
    applicationWindow.on('enter-full-screen', () => {
        applicationWindow.setMenuBarVisibility(false);
        config.setValue('window.fullscreen', true);
    });
    applicationWindow.on('leave-full-screen', () => {
        applicationWindow.setMenuBarVisibility(true);
        config.setValue('window.fullscreen', undefined);
    });

    applicationWindow.loadURL(defaultSpotURL);

    applicationWindow.webContents.on('did-finish-load', () => {
        if (process.platform === 'darwin') {
            /* eslint-disable max-len */
            const code = `
                var _titleBar = document.createElement('div');
                _titleBar.id = 'titleBar';
                _titleBar.setAttribute('style', '-webkit-app-region: drag; position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 32px; min-height: 32px;');
                document.getElementsByTagName('body')[0].prepend(_titleBar);
            `;

            /* eslint-enable max-len */
            applicationWindow.webContents.executeJavaScript(code);
        }
    });

    logger.info(`Spot started with Spot-TV URL ${defaultSpotURL}`);
}

/**
 * Callback to handle 'ready-to-show' event of the main window.
 *
 * @returns {void}
 */
function _onWindowReady() {
    splashWindow && splashWindow.destroy();

    applicationWindow.setMenuBarVisibility(!config.getValue('window.fullscreen'));

    applicationWindow.show();
}

/**
 * Callback to persist window size on resizing the main window.
 *
 * @returns {void}
 */
function _onWindowResize() {
    const [ width, height ] = applicationWindow.getSize();

    config.setValue('window.height', height);
    config.setValue('window.width', width);
}

module.exports = {
    createApplicationWindow
};
