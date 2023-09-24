const os = require('os');

/**
 * Log levels map.
 */
const LOG_LEVEL = {
    0: 'TRACE',
    1: 'DEBUG',
    2: 'INFO',
    3: 'LOG',
    4: 'WARN',
    5: 'ERROR'
};

module.exports = {
    /**
     * Builds the log message.
    */
    parseLogMessage: (level, message) => `[${LOG_LEVEL[level]}] ${message}`,

    /**
     * Returns the host identifier.
     */
    getHostId: () => {
        const ipAddress = [].concat(...Object.values(os.networkInterfaces()))
            .find(networkInterface => !networkInterface.internal && networkInterface.family === 'IPv4')?.address;

        return `${ipAddress}-${os.hostname()}`;
    }
};
