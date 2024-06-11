/**
 * Private helper to execute a terminal command and return the output.
 *
 * @param {string} command - The command to execute.
 * @private
 * @returns {string}
 */
function _executeCommand(command) {
    return require('child_process')
        .execSync(command)
        .toString();
}

const screenCountCommands = {
    /**
     * The function to call to get a count of connected monitors on mac.
     *
     * @returns {number}
     */
    darwin: () => parseInt(
        _executeCommand('system_profiler SPDisplaysDataType | grep -c Resolution'),
        10
    ),

    /**
     * The function to call to get a count of connected monitors on linux.
     *
     * @returns {number}
     */
    linux: () => parseInt(
        _executeCommand('xdpyinfo | grep -c resolution'),
        10
    ),

    /**
     * The function to call to get a count of connected monitors on windows.
     *
     * @returns {number}
     */
    win32: () =>
        _executeCommand(
            'wmic path Win32_PnPEntity where "Service=\'Monitor\'" get deviceid /value')
        .match(/DeviceID/g)
        .length
};

module.exports = {
    /**
     * Returns a count of how many monitors are connected to the machine.
     *
     * @returns {number}
     */
    getScreenCount() {
        const command = screenCountCommands[process.platform];

        if (!command) {
            throw new Error(`No screen count command for env ${process.platform}`);
        }

        try {
            return command();
        } catch(e) {
            return 1;
        }
    }
};
