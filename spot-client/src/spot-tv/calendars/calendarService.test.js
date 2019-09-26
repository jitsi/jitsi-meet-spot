import { calendarTypes } from 'common/app-state';

import backendCalendar from './backend-calendar';
import { CalendarService } from './calendarService';
import { SERVICE_UPDATES } from './constants';

describe('calendarService', () => {
    describe('polling for events', () => {
        let calendarGetResults, calendarService, getCalendarSpy;

        /**
         * Adds a subscriber to a calendar service event which will unsubscribe
         * itself after being fired once.
         *
         * @param {string} eventName - The event name to listen for.
         * @private
         * @returns {Promise} Resolves when the {@code calendarService} fires
         * an event with the passed in event name.
         */
        function createOneTimeCalendarServiceListener(eventName) {
            return new Promise(resolve => {
                const unsubscribe = calendarService.addListener(
                    eventName,
                    result => {
                        unsubscribe();
                        resolve(result);
                    }
                );
            });
        }

        beforeEach(() => {
            calendarGetResults = [];
            jest.spyOn(backendCalendar, 'initialize');
            getCalendarSpy = jest.spyOn(backendCalendar, 'getCalendar')
                .mockImplementation(() => Promise.resolve(calendarGetResults));

            calendarService = new CalendarService();
            calendarService.setConfig(
                {
                    [calendarTypes.BACKEND]: {}
                },
                [ 'test-domain.si' ]
            );
            calendarService.initialize(calendarTypes.BACKEND);
        });

        afterEach(() => {
            calendarService.removeAllListeners();
            calendarService.stopPollingForEvents();
            jest.clearAllMocks();
        });

        test('starts fetching immediately', () => {
            calendarService.startPollingForEvents();

            expect(getCalendarSpy).toHaveBeenCalled();
        });

        test('always notifies on the first fetch', () => {
            const firstEventsListener = createOneTimeCalendarServiceListener(
                SERVICE_UPDATES.EVENTS_UPDATED
            );

            calendarService.startPollingForEvents();

            return firstEventsListener
                .then(events => expect(events).toEqual({ events: calendarGetResults }));
        });

        test('notifies if event updates have been detected', () => {
            jest.useFakeTimers();

            const firstPayload = [
                {
                    meetingUrlFields: [],
                    title: 'a'
                }
            ];
            const secondPayload = [
                {
                    meetingUrlFields: [],
                    title: 'b'
                }
            ];

            calendarGetResults = firstPayload;

            const firstResultPromise = createOneTimeCalendarServiceListener(
                SERVICE_UPDATES.EVENTS_UPDATED
            );

            calendarService.startPollingForEvents();

            return firstResultPromise
                .then(events => {
                    expect(events).toEqual({ events: firstPayload });
                    calendarGetResults = secondPayload;

                    const secondResultPromise = createOneTimeCalendarServiceListener(
                        SERVICE_UPDATES.EVENTS_UPDATED
                    );

                    jest.runAllTimers();

                    return secondResultPromise;
                })
                .then(events => expect(events).toEqual({ events: secondPayload }));
        });

        test('notifies of errors', () => {
            const mockError = 'mock-error';

            jest.spyOn(backendCalendar, 'getCalendar')
                .mockImplementation(() => Promise.reject(mockError));

            const errorPromise = createOneTimeCalendarServiceListener(
                SERVICE_UPDATES.EVENTS_ERROR
            );

            calendarService.startPollingForEvents();

            return errorPromise
                .then(error => expect(error).toEqual({ error: mockError }));
        });

        it('adds the meeting url to the events', () => {
            const event1 = {
                summary: 'meet at https://test-domain.si/anything',
                title: 'a'
            };
            const event2 = {
                summary: 'meet at other-domain.si/anything',
                title: 'b'
            };

            event1.meetingUrlFields = [ event1.summary, event1.title ];
            event2.meetingUrlFields = [ event2.summary, event2.title ];
            calendarGetResults = [ event1, event2 ];

            const eventPromise = createOneTimeCalendarServiceListener(
                SERVICE_UPDATES.EVENTS_UPDATED
            );

            calendarService.startPollingForEvents();

            return eventPromise
                .then(({ events }) => {
                    expect(events[0].meetingUrl).toEqual('https://test-domain.si/anything');
                    expect(events[1].meetingUrl).toEqual(undefined);
                });
        });

        it('does not notify of old requests after multiple poll starts', () => {
            const notExpectedEvents = [
                {
                    meetingUrlFields: [],
                    testEvent: 1
                }
            ];
            const expectedEvents = [
                {
                    meetingUrlFields: [],
                    testEvent: 2
                }
            ];

            jest.spyOn(calendarService, 'getCalendar').mockImplementation(options => {
                if (options.testValue === 1) {
                    return Promise.resolve(notExpectedEvents);
                }

                return Promise.resolve(expectedEvents);
            });
            const eventPromise = createOneTimeCalendarServiceListener(
                SERVICE_UPDATES.EVENTS_UPDATED
            );

            // Queue up two polls immediately, expecting the first not to
            // be honored.
            calendarService.startPollingForEvents({ testValue: 1 });
            calendarService.startPollingForEvents({ testValue: 2 });

            return eventPromise
                .then(({ events }) => expect(events).toEqual(expectedEvents));
        });

        it('notifies of new events after a restart', () => {
            jest.useFakeTimers();

            const firstEvents = [
                {
                    meetingUrlFields: [],
                    title: 1
                }
            ];
            const secondEvents = [
                {
                    meetingUrlFields: [],
                    title: 2
                }
            ];
            const options = {};

            let hasFetched = false;

            jest.spyOn(calendarService, 'getCalendar').mockImplementation(() => {
                if (!hasFetched) {
                    hasFetched = true;

                    return Promise.resolve(firstEvents);
                }

                return Promise.resolve(secondEvents);
            });

            const firstEventsPromise = createOneTimeCalendarServiceListener(
                SERVICE_UPDATES.EVENTS_UPDATED
            );

            calendarService.startPollingForEvents(options);

            return firstEventsPromise
                .then(({ events }) => expect(events).toEqual(firstEvents))
                .then(() => {
                    calendarService.stopPollingForEvents();

                    const secondEventsPromise = createOneTimeCalendarServiceListener(
                        SERVICE_UPDATES.EVENTS_UPDATED
                    );

                    calendarService.startPollingForEvents(options);
                    jest.runAllTimers();

                    return secondEventsPromise;
                })
                .then(({ events }) => expect(events).toEqual(secondEvents));
        });
    });
});
