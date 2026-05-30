import type { BrowserName } from '../constants/index.js';

import PageObject from './page-object.js';

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
    constructor(driver: BrowserName) {
        super(driver, NOTIFICATIONS_CONTAINER);
    }

    /**
     * Waits until a notification for an app error displays.
     *
     * @returns {Promise<void>}
     */
    async waitForErrorToDisplay(): Promise<void> {
        const element = await this.waitForElementDisplayed(ERROR_NOTIFICATIONS);

        await element.click();
    }
}

export default Notifications;
