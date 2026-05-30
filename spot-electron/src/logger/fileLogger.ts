import { app } from 'electron';
import log from 'electron-log/main';
import fs from 'node:fs';
import path from 'node:path';
import { scheduleJob } from 'node-schedule';

log.transports.ipc.level = false;
log.transports.file.resolvePathFn = () => path.join(app.getPath('logs'), 'spot-console.log');
log.transports.file.format = '{iso} {text}';
log.transports.file.maxSize = 1048576 * 20; // 20mb

// Archive the log file every day at 06:00AM.
scheduleJob('0 6 * * *', () => {
    const file = log.transports.file.getFile();

    const currentDate = new Date().toISOString()
        .replaceAll(/([:|.])/g, '-');
    const archiveDateLogFile = path.join(app.getPath('logs'), `spot-console.old.${currentDate}.log`);

    try {
        fs.copyFileSync(file.path, archiveDateLogFile);
        file.clear();
    } catch (error) {
        log.error(error);
    }
});

const CONSOLE_LEVEL_MAP: Record<string, 'debug' | 'error' | 'info' | 'warn'> = {
    debug: 'debug',
    info: 'info',
    warning: 'warn',
    error: 'error'
};

/**
 * Logs a message to file.
 *
 * @param level - The log level as emitted by Electron's `console-message` event
 * (`debug` | `info` | `warning` | `error`).
 * @param message - The main string to be logged.
 * @returns {void}
 */
export function logToFile(level: string, message: string): void {
    const logType = CONSOLE_LEVEL_MAP[level] ?? 'info';

    log[logType](message);
}
