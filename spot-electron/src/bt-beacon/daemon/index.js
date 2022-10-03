const os = require('os');

const platform = os.platform();

/**
 * Import bt-beacon only for darwin platforms.
 */
if (platform === 'darwin') {
    module.exports = require(`./${os.platform()}`);
}
