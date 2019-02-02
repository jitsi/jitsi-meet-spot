/* global remoteControlBrowser, spotBrowser */

const User = require('./user');

/**
 * The current webdriver.io configuration creates two browser drivers. Both
 * are wrapped in a user model and factory getter to abstract that detail from
 * the tests.
 */

const remoteControlUser = new User(remoteControlBrowser);
const spotUser = new User(spotBrowser);

module.exports = {
    /**
     * Returns an instance of {@code User} that can be used to interact with
     * an instance of Spot.
     *
     * @returns {User}
     */
    getSpotUser() {
        return spotUser;
    },

    /**
     * Returns an instance of {@code User} that can be used to interact with
     * an instance of a remote control.
     *
     * @returns {User}
     */
    getRemoteControlUser() {
        return remoteControlUser;
    }
};
