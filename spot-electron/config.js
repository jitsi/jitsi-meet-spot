const process = require('process');

module.exports = {

    /**
     * The default URL to connect to.
     */
    defaultSpotURL: process.env.SPOT_URL || 'https://spot.jitsi.net/spot',

    /**
     * The details of the spash screen, if any.
     */
    // spashScreen: {
    //     height: 192,
    //     logo: 'static/applogo.png',
    //     width: 192
    // },

    window: {
        fullscreen: undefined,
        height: 800,
        width: 1200
    }
};
