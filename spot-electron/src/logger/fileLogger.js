const { app } = require('electron');
const log = require('electron-log');
const fs = require('fs');
const schedule = require('node-schedule');
const path = require('path');

log.transports.ipc.level = false;
log.transports.file.resolvePath = () => path.join(app.getPath('logs'), 'spot-console.log');
log.transports.file.format = '{iso} {text}';
log.transports.file.maxSize = 1048576 * 20; // 20mb

// archive log file every day at 06:00AM
schedule.scheduleJob('0 6 * * *', () => {
    const file = log.transports.file.getFile();

    log.transports.file.archiveLog(file);
    file.reset();

    const currentDate = new Date().toISOString()
        .replaceAll(/([:|.])/g, '-');
    const archiveLogFile = path.join(app.getPath('logs'), 'spot-console.old.log');
    const archiveDateLogFile = path.join(app.getPath('logs'), `spot-console.old.${currentDate}.log`);

    try {
        fs.renameSync(archiveLogFile, archiveDateLogFile);
    } catch (error) {
        log.error(error);
    }
});

const ELECTRON_LEVEL_INDEX_MAP = {
    0: 'debug',
    1: 'info',
    2: 'warn',
    3: 'error'
};

/**
 * Logs a message to file.
 *
 * @param {string} level - The log level index.
 * @param {string} message - The main string to be logged.
 * @returns {void}
 */
function logToFile(level, message) {
    const logType = ELECTRON_LEVEL_INDEX_MAP[level];
    const logMethod = log[logType] || log.log;

    logMethod(message);
}

module.exports = {
    logToFile
};
