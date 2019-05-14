const { app } = require('electron');

const { createApplicationWindow } = require('./src/application-window');

// Imports from features that we need to load.
require('./src/application-menu');

app.on('ready', createApplicationWindow);
