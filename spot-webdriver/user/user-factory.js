/* global remoteControlBrowser, spotBrowser */

const SpotTV = require('./spot-tv-user');
const SpotRemote = require('./spot-remote-user');

/**
 * The current webdriver.io configuration creates two browser drivers. Both
 * are wrapped in a user model and factory getter to abstract that detail from
 * the tests.
 */
let spotRemote, spotTV;

module.exports = {
    /**
     * Returns an instance of {@code SpotTV} which is the main Spot screen.
     *
     * @returns {SpotTV}
     */
    getSpotTV() {
        if (!spotTV) {
            spotTV = new SpotTV(spotBrowser);
        }

        return spotTV;
    },

    /**
     * Returns an instance of {@code SpotRemote} which acts as the remote controller of
     * {@code SpotTV}.
     *
     * @returns {SpotRemote}
     */
    getSpotRemote() {
        if (!spotRemote) {
            spotRemote = new SpotRemote(remoteControlBrowser);
        }

        return spotRemote;
    }
};
