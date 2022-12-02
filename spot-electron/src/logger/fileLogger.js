const log = require('electron-log');
const { app } = require('electron');
const path = require('path');

log.transports.ipc.level = false;
log.transports.file.resolvePath = () => path.join(app.getPath('logs'), 'spot-console.log');
log.transports.file.format = '{iso} {text}';
log.transports.file.maxSize = 1048576 * 20; // 20mb

const JITSI_TO_ELECTRON_LEVELS = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    trace: 'verbose',
    debug: 'debug',
    log: 'log'
};

const ELECTRON_LEVEL_INDEX_MAP = {
    0: JITSI_TO_ELECTRON_LEVELS.debug,
    1: JITSI_TO_ELECTRON_LEVELS.info,
    2: JITSI_TO_ELECTRON_LEVELS.warn,
    3: JITSI_TO_ELECTRON_LEVELS.error
};

/**
 * Logs a message to file.
 *
 * @param {string} level - The log level index.
 * @param {string} message - The main string to be logged a warning.
 * @returns {void}
 */
function logToFile(level, message) {
    const logType = ELECTRON_LEVEL_INDEX_MAP[level];
    const logMethod = log[logType] || log.log;

    logMethod && logMethod(`[${logType}]`, message);
}

module.exports = {
    logToFile
};
