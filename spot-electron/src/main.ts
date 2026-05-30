// Load the dev `.env` first, before anything reads `process.env`.
import './load-env.js';

import { app } from 'electron';
import debug from 'electron-debug';
import isDev from 'electron-is-dev';

// Imports from features that we need to load (for their side effects).
// Import the log transport early as it caches any logs produced even before it is able to send.
import './spot-client-log-transport/index.js';
import './application-menu/index.js';
import './auto-updater/index.js';
import './client-control/index.js';
import './exit/index.js';
import './volume-control/index.js';

import { createApplicationWindow } from './application-window/index.js';

app.setLoginItemSettings({
    openAtLogin: !isDev
});

if (isDev || process.argv.indexOf('--show-devtools') !== -1) {
    debug({
        isEnabled: true,
        showDevTools: true
    });
}

app.on('ready', createApplicationWindow);

app.on(
    'certificate-error',
    (event, _webContents, _url, _error, _certificate, callback) => {
        if (isDev) {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    }
);
