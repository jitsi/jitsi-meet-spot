const { app } = require('electron');

app.setLoginItemSettings({
    openAtLogin: true
});

const { createApplicationWindow } = require('./src/application-window');

// Imports from features that we need to load.
require('./src/application-menu');
require('./src/bt-beacon');
require('./src/client-control');
require('./src/volume-control');

app.on('ready', createApplicationWindow);
