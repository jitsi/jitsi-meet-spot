
import { calendarTypes } from 'common/app-state';
import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';
import { findWhitelistedMeetingUrl } from 'common/utils';
import isEqual from 'lodash.isequal';

import backendCalendar from './backend-calendar';
import { SERVICE_UPDATES } from './constants';
import { hasUpdatedEvents } from './utils';

/**
 * A mapping of a {@code calendarTypes} enum with its associated calendar
 * integration implementation.
 *
 * @private
 * @type {Object}
 */
const calendarIntegrations = {
    [calendarTypes.BACKEND]: backendCalendar
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

        this._currentCalendarPollingOptions = null;
        this._updateEventsTimeout = null;
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
        this._calendarEvents = undefined;

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
        this.pollingInterval = config.POLLING_INTERVAL || 60 * 1000;
    }

    /**
     * Begin fetching and automatically re-fetching calendar events.
     *
     * @param {Object} options - Options required for fetch the calendar events.
     * See {@code getCalendar} for details.
     * @returns {void}
     */
    startPollingForEvents(options) {
        // No-op if already polling with the provided options.
        if (this._updateEventsTimeout && this._pollingOptionsAreEqual(options)) {
            return;
        }

        this._currentCalendarPollingOptions = { ...options };

        this.stopPollingForEvents();

        logger.info('Calendar start polling', { interval: this.pollingInterval });

        this._pollForEvents(this._currentCalendarPollingOptions);
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
     * Sets a timeout for the next calendar polling.
     *
     * @param {Object} options - Options to use while fetching calendar events.
     * @param {number} time - How long to wait until the next poll.
     * @private
     * @returns {void}
     */
    _enqueueNextCalendarPoll(options, time) {
        if (!this._pollingOptionsAreEqual(options)) {
            return;
        }

        this.stopPollingForEvents();

        this._updateEventsTimeout = setTimeout(
            () => this._pollForEvents(options),
            time
        );
    }

    /**
     * Fetches calendar events and sets an interval to fetch again.
     *
     * @param {Object} options - Options required for fetch the calendar events.
     * See {@code getCalendar} for details.
     * @param {Object} extras - Extra flags which are not specified  through the config.
     * @param {boolean} isPolling - Indicates whether or not the call is being executed as part of scheduled polling
     * logic. Falsy value means that events are being checked in response to a push event. Is sent as part of
     * the calendar update event to be consumed by analytics.
     * @private
     * @returns {void}
     */
    _pollForEvents(options, { isPolling } = { isPolling: true }) {
        this.getCalendar(options)
            .then(formattedEvents => {
                if (!this._pollingOptionsAreEqual(options)) {
                    return;
                }

                const events = this._updateMeetingUrlOnEvents(formattedEvents);

                if (hasUpdatedEvents(this._calendarEvents, events)) {
                    this._calendarEvents = events;

                    this.emit(
                        SERVICE_UPDATES.EVENTS_UPDATED,
                        {
                            events: this._calendarEvents,
                            isPolling
                        }
                    );
                }

                // Try again in 1 minute
                this._enqueueNextCalendarPoll(options, this.pollingInterval);
            }, error => {
                if (!this._pollingOptionsAreEqual(options)) {
                    return;
                }

                this._calendarEvents = undefined;

                logger.error('Calendar _pollForEvents error: ', {
                    error,
                    isPolling
                });
                this.emit(
                    SERVICE_UPDATES.EVENTS_ERROR,
                    {
                        error,
                        isPolling
                    }
                );

                // Try again in 5 minutes
                this._enqueueNextCalendarPoll(options, 1000 * 60 * 5);
            });
    }

    /**
     * This method is to be called when the application wants to update the calendar events on demand. For example when
     * there's push mechanism enabled. It will first cancel any polling task, refresh the events and reschedule
     * the polling according to the configured interval.
     *
     * @returns {void}
     */
    refreshCalendarEvents() {
        this.stopPollingForEvents();

        this._pollForEvents(this._currentCalendarPollingOptions, { isPolling: false });
    }

    /**
     * Compares calendar options, used for fetching calendar events, with
     * previously used options.
     *
     * @param {Object} options - Options to use while fetching calendar events.
     * @private
     * @returns {boolean}
     */
    _pollingOptionsAreEqual(options) {
        return isEqual(options, this._currentCalendarPollingOptions);
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
                meetingUrl: findWhitelistedMeetingUrl(fieldsToSearch, this.knownDomains)
            };
        });
    }
}

export default new CalendarService();
