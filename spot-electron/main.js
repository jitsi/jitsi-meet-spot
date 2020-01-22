require('electron-is-dev') && require('dotenv').config();

const { app } = require('electron');

app.setLoginItemSettings({
    openAtLogin: true
});

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
