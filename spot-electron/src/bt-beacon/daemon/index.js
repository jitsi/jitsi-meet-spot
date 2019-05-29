const os = require('os');

module.exports = require(`./${os.platform()}`);
