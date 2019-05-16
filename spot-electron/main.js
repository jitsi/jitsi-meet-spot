const { app } = require('electron');

const { createApplicationWindow } = require('./src/application-window');

// Imports from features that we need to load.
require('./src/application-menu');
require('./src/client-control');
require('./src/volume-control');

app.on('ready', createApplicationWindow);
