import lolex from 'lolex';
import { createStore } from 'redux';
import thunk from 'redux-thunk';

import reducers, { routeChanged, setBootstrapComplete, setDefaultValues, setSpotTVState } from 'common/app-state';
import { setPermanentPairingCode } from 'common/backend';
import { MiddlewareRegistry, ReducerRegistry, StateListenerRegistry } from 'common/redux';
import { ROUTES } from 'common/routing';

import { NIGHTLY_RELOAD_POLL_INTERVAL, WEB_UPDATE_POLL_INTERVAL } from './AutoUpdateController';
import './reducer';
import { isOkToUpdate, isTimeForNightlyReload, isWebUpdateAvailable } from './selectors';
import { _setLastLoadTime } from './actions';
import { UPDATE_WEB_SOURCE } from './actionTypes';

const DATE_TIME_AT_2_10_AM = 1574043000000; // 18 November 2019 02:10:00
const DATE_TIME_AT_1_10_AM = 1574039400000; // 18 November 2019 01:10:00

/**
 * Resolves on the next tick.
 *
 * @returns {Promise<void>}
 */
function nextTick() {
    return new Promise(resolve => {
        process.nextTick(resolve);
    });
}

describe('AutoUpdateController', () => {
    let mockSystemClock, store, updateWebSourceTriggered;

    beforeEach(() => {
        mockSystemClock = lolex.install();

        updateWebSourceTriggered = undefined;
        MiddlewareRegistry.register(() => next => action => {
            if (action.type === UPDATE_WEB_SOURCE) {
                updateWebSourceTriggered = true;
            }

            return next(action);
        });

        const config = {
            ...setDefaultValues(window.JitsiMeetSpotConfig)
        };

        // Enable backend
        config.SPOT_SERVICES = {
            pairingServiceUrl: '1234'
        };

        store = createStore(
            ReducerRegistry.combineReducers(reducers),
            {
                config
            },
            MiddlewareRegistry.applyMiddleware(thunk)
        );

        // StateListenerRegistry
        StateListenerRegistry.subscribe(store);

        store.dispatch(setBootstrapComplete());

        // Start each test with the is OK to update conditions met
        store.dispatch(setPermanentPairingCode('1234'));
        store.dispatch(setSpotTVState({
            view: 'not-a-meeting'
        }));
    });

    describe('sets is OK to update flag', () => {
        it('to true if all conditions are met', () => {
            expect(isOkToUpdate(store.getState())).toBe(true);
        });
        describe('to false', () => {
            it('if there\'s no permanent pairing', () => {
                store.dispatch(setPermanentPairingCode(undefined));

                expect(isOkToUpdate(store.getState())).toBe(false);
            });
            it('on a wrong route', () => {
                store.dispatch(routeChanged({
                    pathname: ROUTES.LOADING
                }));

                expect(isOkToUpdate(store.getState())).toBe(false);
            });
            it('on the meeting view', () => {
                store.dispatch(routeChanged({
                    pathname: ROUTES.REMOTE_CONTROL
                }));
                store.dispatch(setSpotTVState({
                    view: 'meeting'
                }));

                expect(isOkToUpdate(store.getState())).toBe(false);
            });
        });
    });
    describe('sets webUpdateAvailable', () => {
        it('to true if there\'s new version', () => {
            fetch.once(JSON.stringify({
                spotClientVersion: 'development2'
            }));

            mockSystemClock.tick(WEB_UPDATE_POLL_INTERVAL);

            return nextTick().then(() => {
                expect(isWebUpdateAvailable(store.getState())).toBe(true);
            });
        });
        it('to false if there\'s no new version', () => {
            fetch.once(JSON.stringify({
                spotClientVersion: 'development'
            }));

            mockSystemClock.tick(WEB_UPDATE_POLL_INTERVAL);

            return nextTick().then(() => {
                expect(isWebUpdateAvailable(store.getState())).toBe(false);
            });
        });
    });
    describe('sets isNightlyReloadTime', () => {
        it('to true if within the configured time range', () => {
            mockSystemClock.setSystemTime(DATE_TIME_AT_2_10_AM);

            store.dispatch(_setLastLoadTime(DATE_TIME_AT_2_10_AM - (25 * 60 * 60 * 1000)));

            mockSystemClock.tick(NIGHTLY_RELOAD_POLL_INTERVAL);

            return nextTick().then(() => {
                expect(isTimeForNightlyReload(store.getState())).toBe(true);
            });
        });
        it('to false if not within the configure time range', () => {
            mockSystemClock.setSystemTime(DATE_TIME_AT_1_10_AM);

            store.dispatch(_setLastLoadTime(DATE_TIME_AT_1_10_AM - (25 * 60 * 60 * 1000)));

            mockSystemClock.tick(NIGHTLY_RELOAD_POLL_INTERVAL);

            return nextTick().then(() => {
                expect(isTimeForNightlyReload(store.getState())).toBe(false);
            });
        });
        it('to false if the last load time time is recent', () => {
            mockSystemClock.setSystemTime(DATE_TIME_AT_2_10_AM); // 18 November 2019 02:10:00

            store.dispatch(_setLastLoadTime(DATE_TIME_AT_2_10_AM - (60 * 1000)));

            mockSystemClock.tick(NIGHTLY_RELOAD_POLL_INTERVAL);

            return nextTick().then(() => {
                expect(isTimeForNightlyReload(store.getState())).toBe(false);
            });
        });
    });
    describe('the update web source action', () => {
        it('is dispatched if web update is available', () => {
            fetch.once(JSON.stringify({
                spotClientVersion: 'development2'
            }));

            mockSystemClock.setSystemTime(DATE_TIME_AT_1_10_AM);

            mockSystemClock.tick(Math.max(WEB_UPDATE_POLL_INTERVAL, NIGHTLY_RELOAD_POLL_INTERVAL));

            return nextTick().then(() => {
                expect(updateWebSourceTriggered).toBe(true);
            });
        });
        it('is dispatched if it\'s the nightly reload time', () => {
            fetch.once(JSON.stringify({
                spotClientVersion: 'development'
            }));

            mockSystemClock.setSystemTime(DATE_TIME_AT_2_10_AM);

            store.dispatch(_setLastLoadTime(DATE_TIME_AT_2_10_AM - (25 * 60 * 60 * 1000)));

            mockSystemClock.tick(Math.max(WEB_UPDATE_POLL_INTERVAL, NIGHTLY_RELOAD_POLL_INTERVAL));

            return nextTick().then(() => {
                expect(updateWebSourceTriggered).toBe(true);
            });
        });
        it('is not dispatched if no web update nor nightly reload time', () => {
            fetch.once(JSON.stringify({
                spotClientVersion: 'development'
            }));

            mockSystemClock.setSystemTime(DATE_TIME_AT_1_10_AM);

            mockSystemClock.tick(Math.max(WEB_UPDATE_POLL_INTERVAL, NIGHTLY_RELOAD_POLL_INTERVAL));

            return nextTick().then(() => {
                expect(updateWebSourceTriggered).toBe(undefined);
            });
        });
    });
});
