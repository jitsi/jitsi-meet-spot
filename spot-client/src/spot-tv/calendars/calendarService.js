import { calendarTypes } from 'common/app-state';
import { Emitter } from 'common/emitter';

import backendCalendar from './backend-calendar';
import { SERVICE_UPDATES } from './constants';
import google from './google';
import outlook from './outlook';
import { hasUpdatedEvents } from './utils';

import { getMeetingUrl } from './event-parsers';

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
export class CalendarService extends Emitter {
    /**
     * @typedef {Object} Event
     *
     * @property {string} id - The unique identifier for the event.
     * @property {string} end - The date string for when the event will end.
     * @property {string} meetingUrl - The Jitsi-Meet URL on which the meeting
     * will occur.
     * @property {Array<string>} meetingUrlFields - Strings which may contain
     * the meeting url.
     * @property {Array<Participant>} participants - The participants invited
     * confirmed to join the event.
     * @property {string} start - The date string for when the event will being.
     * @property {string} title - The name of the event.
     */

    /**
     * @typedef {Object} Participant
     *
     * @property {email} string - The email address associate with the user
     * attending the event.
     */

    /**
     * Initializes a new {@code CalendarService} instance.
     */
    constructor() {
        super();

        /**
         * A cache of the last calendar events that have been fetched.
         */
        this._calendarEvents = [];

        this._hasFetchedEvents = false;
    }

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

        /**
         * A cache of previously fetched events. Used for diffing with any new
         * fetch to determine if a calendar change notification should be
         * emitted.
         *
         * @type {Array<Event>}
         */
        this._calendarEvents = [];

        this._hasFetchedEvents = false;

        return this._calendarIntegration.initialize(this.config[type]);
    }

    /**
     * Requests current calendar events for a provided resource.
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
    }

    /**
     * Gets the constants from {@code calendarTypes} for the currently
     * selected calendar integration.
     *
     * @returns {string|undefined}
     */
    getType() {
        return this._calendarIntegration && this._calendarIntegration.getType();
    }

    /**
     * Requests the rooms accessible by the account linked to the currently
     * active calendar integration.
     *
     * @param {string} roomNameFilter - A string to use for filtering rooms by
     * name.
     * @returns {Promise<Array<Object>>}
     */
    getRooms(roomNameFilter = '') {
        return this._calendarIntegration.getRooms(roomNameFilter);
    }

    /**
     * Sets a reference to all configuration objects necessary to initialize
     * calendar integrations.
     *
     * @param {Object} config - The calendar configuration objects.
     * @param {Array<string>} knownDomains - A whitelist of meeting urls to
     * search for when parsing meeting events.
     * @returns {void}
     */
    setConfig(config, knownDomains) {
        this.config = config;
        this.knownDomains = knownDomains;
    }

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
    }

    /**
     * Stop any ongoing process to automatically fetch calendar events.
     *
     * @returns {void}
     */
    stopPollingForEvents() {
        clearTimeout(this._updateEventsTimeout);
        this._updateEventsTimeout = null;
    }

    /**
     * Display the calendar integration sign in flow.
     *
     * @returns {Promise} Resolves when sign in completes successfully.
     */
    triggerSignIn() {
        return this._calendarIntegration.triggerSignIn();
    }

    /**
     * Fetches calendar events and sets an interval to fetch again.
     *
     * @param {Object} options - Options required for fetch the calendar events.
     * See {@code getCalendar} for details.
     * @private
     * @returns {void}
     */
    _pollForEvents(options) {
        this.getCalendar(options)
            .then(formattedEvents => {
                const events = this._updateMeetingUrlOnEvents(formattedEvents);

                if (!this._hasFetchedEvents
                    || hasUpdatedEvents(this._calendarEvents, events)) {
                    this._hasFetchedEvents = true;
                    this._calendarEvents = events;

                    this.emit(
                        SERVICE_UPDATES.EVENTS_UPDATED,
                        { events: this._calendarEvents }
                    );
                }

                this._updateEventsTimeout = setTimeout(
                    () => this._pollForEvents(options),
                    60000 // Get new events in 60 seconds
                );
            })
            .catch(error => {
                this.emit(SERVICE_UPDATES.EVENTS_ERROR, { error });

                this._updateEventsTimeout = setTimeout(
                    () => this._pollForEvents(options),
                    1000 * 60 * 5 // Try again in 5 minutes
                );
            });
    }

    /**
     * Modifies the passed in events by replacing the meetingUrlFields field
     * with a meetingUrl field that has a link to a valid Jitsi-Meet meeting,
     * if available.
     *
     * @param {Array<Event>} events - The calendar events.
     * @private
     * @returns {Array<Event>} The calendar events with meeting urls as a field.
     */
    _updateMeetingUrlOnEvents(events) {
        return events.map(event => {
            const fieldsToSearch = event.meetingUrlFields;

            delete event.meetingUrlFields;

            return {
                ...event,
                meetingUrl: getMeetingUrl(fieldsToSearch, this.knownDomains)
            };
        });
    }
}

export default new CalendarService();
