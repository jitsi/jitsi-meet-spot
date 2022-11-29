const { logger } = require('../logger');

const handleLoaded = () => {
    // Window object to be used to comunicate between main and render process.
    // Switch to `contextBridge` if `contextIsolation` is set to `true`.
    window.api = {
        logToFile: logger.logToFile
    };
};

process.on('loaded', handleLoaded);
