require('electron-is-dev') && require('dotenv').config();

const { app, dialog } = require('electron');
const { exec } = require('child_process');

app.setLoginItemSettings({
    openAtLogin: true
});

const execute = command => new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            reject({
                error,
                stderr
            });
        } else {
            resolve(stdout);
        }
    });
});

const { createApplicationWindow } = require('./src/application-window');

// Imports from features that we need to load.
// Import log transport early as it caches any logs produced even before able to send.
require('./src/spot-client-log-transport');
require('./src/application-menu');
require('./src/auto-updater');
require('./src/bt-beacon');
require('./src/client-control');
require('./src/exit');
require('./src/volume-control');

app.on('ready', () => {
    const appPath = app.getAppPath();

    console.info(`Checking write access to the app path: ${appPath}`);

    // FIXME work in progress - works on Mac only
    execute(`test -w ${appPath}`).then(() => {
        createApplicationWindow();
    }, error => {
        console.error('The app path is not writeable', { error });
        dialog.showErrorBox(
            'Permission error',
            `The user doesn't have write access to the application folder. Error: ${JSON.stringify(error)}`);
        app.quit();
    });
});
