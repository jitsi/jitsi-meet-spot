const os = require('os');
const osRelease = parseFloat(os.release());

// older macOS support comes later
module.exports = osRelease >= 18 ? require('./bluetoothd') : undefined;
