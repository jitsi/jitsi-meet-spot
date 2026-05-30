
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
 */
const calendarIntegrations: Record<string, any> = {
    [calendarTypes.BACKEND]: backendCalendar
};

/**
 * The participants invited/confirmed to join an event.
 */
interface Participant {

    /**
     * The email address associated with the user attending the event.
     */
    email: string;
}

/**
 * Describes a calendar event.
 */
interface Event {

    /**
     * The unique identifier for the event.
     */
    id: string;

    /**
     * The date string for when the event will end.
     */
    end: string;

    /**
     * The Jitsi-Meet URL on which the meeting will occur.
     */
    meetingUrl?: string;

    /**
     * Strings which may contain the meeting url.
     */
    meetingUrlFields?: Array<string>;

    /**
     * The participants invited/confirmed to join the event.
     */
    participants?: Array<Participant>;

    /**
     * The date string for when the event will begin.
     */
    start: string;

    /**
     * The name of the event.
     */
    title: string;
}

/**
 * Options required for fetching the calendar events.
 */
interface CalendarOptions {

    /**
     * The account email from which to request calendar events.
     */
    email: string;

    /**
     * The JWT required for authentication (used only by some calendars).
     */
    jwt?: string;
}

/**
 * The interface for interacting with a calendar integration.
 */
export class CalendarService extends Emitter {
    config: any;
    knownDomains: Array<string> | undefined;
    pollingInterval: number | undefined;

    _calendarEvents: Array<Event> | undefined;
    _calendarIntegration: any;
    _currentCalendarPollingOptions: CalendarOptions | null;
    _updateEventsTimeout: ReturnType<typeof setTimeout> | null;

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
     * @param type - The calendar integration to initialize.
     * @returns Resolves when the calendar integration has loaded.
     */
    initialize(type?: string): Promise<any> {
        if (!type) {
            return Promise.resolve();
        }

        this._calendarIntegration = calendarIntegrations[type];

        /**
         * A cache of previously fetched events. Used for diffing with any new
         * fetch to determine if a calendar change notification should be
         * emitted.
         */
        this._calendarEvents = undefined;

        return this._calendarIntegration.initialize(this.config[type]);
    }

    /**
     * Requests current calendar events for a provided resource.
     *
     * @param options - Options required for fetch the calendar events.
     * @returns
     */
    getCalendar(options: CalendarOptions): Promise<Array<Event>> {
        return this._calendarIntegration.getCalendar(options);
    }

    /**
     * Gets the constants from {@code calendarTypes} for the currently
     * selected calendar integration.
     *
     * @returns
     */
    getType(): string | undefined {
        return this._calendarIntegration && this._calendarIntegration.getType();
    }

    /**
     * Requests the rooms accessible by the account linked to the currently
     * active calendar integration.
     *
     * @param roomNameFilter - A string to use for filtering rooms by
     * name.
     * @returns
     */
    getRooms(roomNameFilter = ''): Promise<Array<any>> {
        return this._calendarIntegration.getRooms(roomNameFilter);
    }

    /**
     * Sets a reference to all configuration objects necessary to initialize
     * calendar integrations.
     *
     * @param config - The calendar configuration objects.
     * @param knownDomains - A whitelist of meeting urls to
     * search for when parsing meeting events.
     * @returns
     */
    setConfig(config: any, knownDomains: Array<string>): void {
        this.config = config;
        this.knownDomains = knownDomains;
        this.pollingInterval = config.POLLING_INTERVAL || 60 * 1000;
    }

    /**
     * Begin fetching and automatically re-fetching calendar events.
     *
     * @param options - Options required for fetch the calendar events.
     * See {@code getCalendar} for details.
     * @returns
     */
    startPollingForEvents(options: CalendarOptions): void {
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
     * @returns
     */
    stopPollingForEvents(): void {
        if (this._updateEventsTimeout) {
            clearTimeout(this._updateEventsTimeout);
        }
        this._updateEventsTimeout = null;
    }

    /**
     * Display the calendar integration sign in flow.
     *
     * @returns Resolves when sign in completes successfully.
     */
    triggerSignIn(): Promise<any> {
        return this._calendarIntegration.triggerSignIn();
    }

    /**
     * Sets a timeout for the next calendar polling.
     *
     * @param options - Options to use while fetching calendar events.
     * @param time - How long to wait until the next poll.
     * @private
     * @returns
     */
    _enqueueNextCalendarPoll(options: CalendarOptions, time: number): void {
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
     * @param options - Options required for fetch the calendar events.
     * See {@code getCalendar} for details.
     * @param extras - Extra flags which are not specified  through the config.
     * @param isPolling - Indicates whether or not the call is being executed as part of scheduled polling
     * logic. Falsy value means that events are being checked in response to a push event. Is sent as part of
     * the calendar update event to be consumed by analytics.
     * @private
     * @returns
     */
    _pollForEvents(
            options: CalendarOptions | null,
            { isPolling }: { isPolling: boolean; } = { isPolling: true }): void {
        this.getCalendar(options as CalendarOptions)
            .then(formattedEvents => {
                if (!this._pollingOptionsAreEqual(options)) {
                    return;
                }

                const events = this._updateMeetingUrlOnEvents(formattedEvents);

                if (hasUpdatedEvents(this._calendarEvents as Array<Event>, events)) {
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
                this._enqueueNextCalendarPoll(options as CalendarOptions, this.pollingInterval as number);
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
                this._enqueueNextCalendarPoll(options as CalendarOptions, 1000 * 60 * 5);
            });
    }

    /**
     * This method is to be called when the application wants to update the calendar events on demand. For example when
     * there's push mechanism enabled. It will first cancel any polling task, refresh the events and reschedule
     * the polling according to the configured interval.
     *
     * @returns
     */
    refreshCalendarEvents(): void {
        this.stopPollingForEvents();

        this._pollForEvents(this._currentCalendarPollingOptions, { isPolling: false });
    }

    /**
     * Compares calendar options, used for fetching calendar events, with
     * previously used options.
     *
     * @param options - Options to use while fetching calendar events.
     * @private
     * @returns
     */
    _pollingOptionsAreEqual(options: CalendarOptions | null): boolean {
        return isEqual(options, this._currentCalendarPollingOptions);
    }

    /**
     * Modifies the passed in events by replacing the meetingUrlFields field
     * with a meetingUrl field that has a link to a valid Jitsi-Meet meeting,
     * if available.
     *
     * @param events - The calendar events.
     * @private
     * @returns The calendar events with meeting urls as a field.
     */
    _updateMeetingUrlOnEvents(events: Array<Event>): Array<Event> {
        return events.map(event => {
            const fieldsToSearch = event.meetingUrlFields;

            delete event.meetingUrlFields;

            return {
                ...event,
                meetingUrl: findWhitelistedMeetingUrl(fieldsToSearch ?? [], this.knownDomains as Array<string>)
            };
        });
    }
}

export default new CalendarService();
