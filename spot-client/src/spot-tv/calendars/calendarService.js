import { calendarTypes } from 'common/app-state';
import { hasUpdatedEvents } from 'common/utils';

import backendCalendar from './backend-calendar';
import google from './google';
import outlook from './outlook';

/**
 * A mapping of a {@code calendarTypes} enum with its associated calendar
 * integration implementation.
 *
 * @private
 * @type {Object}
 */
const calendarIntegrations = {
    [calendarTypes.BACKEND]: backendCalendar,
    [calendarTypes.GOOGLE]: google,
    [calendarTypes.OUTLOOK]: outlook
};

/**
 * The interface for interacting with a calendar integration.
 */
export default {
    /**
     * A cache of the last calendar events that have been fetched.
     */
    _events: [],

    /**
     * The callbacks to invoke when a service event has occurred.
     */
    _listeners: new Set(),

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
     * Gets the constants from {@code calendarTypes} for the currently
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
     * Register for service update events.
     *
     * @param {Function} listener - A callback to invoke when this service has
     * an update.
     * @returns {void}
     */
    startListeningForEvents(listener) {
        this._listeners.add(listener);
    },

    /**
     * Begin fetching and automatically re-fetching calendar events.
     *
     * @param {Object} options - Options required for fetch the calendar events.
     * See {@code getCalendar} for details.
     * @returns {void}
     */
    startPollingForEvents(options) {
        if (this._updateEventsTimeout) {
            return;
        }

        this._pollForEvents(options);
    },

    /**
     * Stop being notified of service update events.
     *
     * @param {Function} listener - The callback which should no longer receive
     * updates.
     * @returns {void}
     */
    stopListeningForEvents(listener) {
        this._listeners.delete(listener);
    },

    /**
     * Stop any ongoing process to automatically fetch calendar events.
     *
     * @returns {void}
     */
    stopPollingForEvents() {
        clearTimeout(this._updateEventsTimeout);
        this._updateEventsTimeout = null;
    },

    /**
     * Display the calendar integration sign in flow.
     *
     * @returns {Promise} Resolves when sign in completes successfully.
     */
    triggerSignIn() {
        return this._calendarIntegration.triggerSignIn();
    },

    /**
     * Notifies registered listeners of an update.
     *
     * @param {string} eventName - The event type.
     * @param {Object} data  - Additional information about the event.
     * @private
     * @returns {void}
     */
    _emit(eventName, data = {}) {
        this._listeners.forEach(listener => listener(eventName, data));
    },

    /**
     * Fetches calendar events and sets an interval to fetch again.
     *
     * @param {Object} options - Options required for fetch the calendar events.
     * See {@code getCalendar} for details.
     * @returns {void}
     * @private
     */
    _pollForEvents(options) {
        this.getCalendar(options)
            .then(events => {
                if (hasUpdatedEvents(this._events, events)) {
                    this._events = events;

                    this._emit('events-updated', { events: this._events });
                }

                this._updateEventsTimeout = setTimeout(
                    () => this._pollForEvents(options),
                    60000 // Get new events in 60 seconds
                );
            })
            .catch(error => {
                this._emit('events-error', { error });

                this._updateEventsTimeout = setTimeout(
                    () => this._pollForEvents(options),
                    1000 * 60 * 5 // Try again in 5 minutes
                );
            });
    }
};
