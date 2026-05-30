import { execSync } from 'node:child_process';

/**
 * Private helper to execute a terminal command and return the output.
 *
 * @param command - The command to execute.
 * @private
 * @returns {string}
 */
function _executeCommand(command: string): string {
    return execSync(command).toString();
}

const screenCountCommands: Partial<Record<NodeJS.Platform, () => number>> = {
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
        ?.length ?? 1
};

/**
 * Returns a count of how many monitors are connected to the machine.
 *
 * @returns {number}
 */
export function getScreenCount(): number {
    const command = screenCountCommands[process.platform];

    if (!command) {
        throw new Error(`No screen count command for env ${process.platform}`);
    }

    try {
        return command();
    } catch {
        return 1;
    }
}
