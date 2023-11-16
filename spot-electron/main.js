require('electron-is-dev') && require('dotenv').config();
const { app } = require('electron');
const debug = require('electron-debug');
const isDev = require('electron-is-dev');
const process = require('process');

app.setLoginItemSettings({
    openAtLogin: !isDev
});


if (isDev || process.argv.indexOf('--show-devtools') !== -1) {
    debug({
        isEnabled: true,
        showDevTools: true
    });
}

const { createApplicationWindow } = require('./src/application-window');

// Imports from features that we need to load.
// Import log transport early as it caches any logs produced even before able to send.
require('./src/spot-client-log-transport');
require('./src/application-menu');
require('./src/auto-updater');
require('./src/client-control');
require('./src/exit');
require('./src/volume-control');

app.on('ready', createApplicationWindow);

app.on(
    'certificate-error',
    // eslint-disable-next-line max-params
    (event, webContents, url, error, certificate, callback) => {
        if (isDev) {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    }
);
