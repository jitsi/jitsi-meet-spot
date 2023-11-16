const process = require('process');

module.exports = {

    /**
     * The default URL to connect to.
     */
    defaultSpotURL: process.env.SPOT_URL || 'https://spot.jitsi.net/tv'
};
