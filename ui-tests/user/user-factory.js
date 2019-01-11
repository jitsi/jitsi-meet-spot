const User = require('./user');

/**
 * Webdriver.io creates a global browser driver called "browser." It is wrapped
 * in a user model and factory getter to abstract that detail from the tests.
 */
const user = new User(browser);

module.exports = {
    /**
     * Returns an instance of {@code User} that can be used to interact with
     * an instance of Spot.
     *
     * @returns {User}
     */
    getUser() {
        return user;
    }
};
