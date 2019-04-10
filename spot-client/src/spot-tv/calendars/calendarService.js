import { integrationTypes } from 'common/app-state';

import backendCalendar from './backend-calendar';
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
    [integrationTypes.BACKEND]: backendCalendar,
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
     * @param {string} type - The calendar integration to initialize.
     * @returns {Promise} Resolves when the calendar integration has loaded.
     */
    initialize(type) {
        if (!type) {
            return Promise.resolve();
        }

        this._calendarIntegration = calendarIntegrations[type];

        return this._calendarIntegration.initialize(this.config[type]);
    },

    /**
     * Requests current calendar events for a provided room.
     *
     * @param {Object} options - Options required for fetch the calendar events.
     * @param {string} options.email - The account email from which to request calendar
     * events.
     * @param {string} [options.jwt] - The JWT required for authentication (used only by some
     * calendars).
     * @returns {Promise<Array<Object>>}
     */
    getCalendar(options) {
        return this._calendarIntegration.getCalendar(options);
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
     * Sets a reference to all configuration objects necessary to initialize
     * calendar integrations.
     *
     * @param {Object} config - The calendar configuration objects.
     * @returns {void}
     */
    setConfig(config) {
        this.config = config;
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
