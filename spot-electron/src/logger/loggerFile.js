const log = require('electron-log');

log.transports.ipc.level = false;
log.transports.file.resolvePath = () => '8x8-spaces-logs.log';
log.transports.file.format = '{iso} {text}';

const JITSI_TO_ELECTRON_LEVELS = {
    'error': 'error',
    'warn': 'warn',
    'info': 'info',
    'trace': 'verbose',
    'debug': 'debug',
    'log': 'log'
};

/**
 * Logs a message to file.
 *
 * @param {string} loggerName - The logger name prefix for a message.
 * @param {string} level - The log level type.
 * @param {string} message - The main string to be logged a warning.
 * @param {Object} [context] - Additional information to be logged.
 * @returns {void}
 */
function logToFile(loggerName, level, message, context) {
    const logMethod = log[JITSI_TO_ELECTRON_LEVELS[level]];

    if (logMethod) {
        logMethod && logMethod(`[${loggerName}]`, `[${level}]`, message, context ? JSON.stringify(context) : '');
    } else {
        log.error(`Failed to map jitsi to electron log level:${level}`);
    }
}

module.exports = {
    logToFile
};
