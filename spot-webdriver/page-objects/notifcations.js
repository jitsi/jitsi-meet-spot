const PageObject = require('./page-object');

const ERROR_NOTIFICATIONS = '[data-qa-id=notifications] .notification-error';
const NOTIFICATIONS_CONTAINER = '[data-qa-id=notifications]';

/**
 * A page object for interacting with app notifications.
 *
 * @extends PageObject
 */
class Notifications extends PageObject {
    /**
     * Initializes a new {@code Notifications} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.rootSelector = NOTIFICATIONS_CONTAINER;
    }

    /**
     * Waits until a notification for an app error displays.
     *
     * @returns {void}
     */
    waitForErrorToDisplay() {
        this.waitForElementDisplayed(ERROR_NOTIFICATIONS);

        // Workaround to make sure the notification is displayed and is
        // displayed on top of other elements.
        this.select(ERROR_NOTIFICATIONS).click();
    }
}

module.exports = Notifications;
