import { integrationTypes } from './constants';
import google from './google';
import outlook from './outlook';

/**
 * A mapping of a {@code integrationTypes} enum with its associated calendar
 * integration implementation.
 *
 * @private
 * @type {Object}
 */
const calendarIntegrations = {
    [integrationTypes.GOOGLE]: google,
    [integrationTypes.OUTLOOK]: outlook
};

/**
 * The interface for interacting with a calendar integration.
 */
export default {
    /**
     * Triggers any loading necessary for a calendar integration to be usable.
     *
     * @returns {Promise} Resolves when the calendar integration has loaded.
     */
    initialize(type) {
        if (!type) {
            return Promise.resolve();
        }

        this._calendarIntegration = calendarIntegrations[type];

        return this._calendarIntegration.initialize();
    },

    /**
     * Requests current calendar events for a provided room.
     *
     * @param {string} email - The account email from which to request calendar
     * events.
     * @returns {Promise<Array<Object>>}
     */
    getCalendar(email) {
        return this._calendarIntegration.getCalendar(email);
    },

    /**
     * Gets the constants from {@code integrationTypes} for the currently
     * selected calendar integration.
     *
     * @returns {string|undefined}
     */
    getType() {
        return this._calendarIntegration && this._calendarIntegration.getType();
    },

    /**
     * Requests the rooms accessible by email linked to the currently active
     * calendar integration.
     *
     * @returns {Promise<Array<Object>>}
     */
    getRooms() {
        return this._calendarIntegration.getRooms();
    },

    /**
     * Display the calendar integration sign in flow.
     *
     * @returns {Promise} Resolves when sign in completes successfully.
     */
    triggerSignIn() {
        return this._calendarIntegration.triggerSignIn();
    }
};
