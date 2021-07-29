const process = require('process');

module.exports = {

    /**
     * Config values for the beacon functionality.
     */
    beacon: {

        /**
         * Region ID for the beacon. This is permanent and must be unique for custom deployments.
         */
        region: 'bf23c311-24ae-414b-b153-cf097836947f'
    },

    /**
     * The default URL to connect to.
     */
    defaultSpotURL: process.env.SPOT_URL || 'https://spot.jitsi.net/tv'
};
