import isEqual from 'lodash.isequal';

import {
    BOOTSTRAP_COMPLETE,
    getCurrentView,
    getCurrentRoute,
    getUpdateEndHour,
    getUpdateStartHour
} from 'common/app-state';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { date } from 'common/date';
import { MiddlewareRegistry, StateListenerRegistry } from 'common/redux';
import { ROUTES } from 'common/routing';

import {
    checkForWebUpdateAvailable,
    setOkToUpdate,
    setIsNightlyReloadTime,
    updateWebSource
} from './actions';
import {
    _getLastLoadTime,
    isOkToUpdate,
    isTimeForNightlyReload,
    isWebUpdateAvailable
} from './selectors';
import TimeRangePoller from './TimeRangePoller';

/**
 * How often the controller checks if it's the nightly reload time.
 *
 * @type {number}
 */
export const NIGHTLY_RELOAD_POLL_INTERVAL = 30000;

/**
 * How often the check for web source update happens.
 *
 * @type {number}
 */
export const WEB_UPDATE_POLL_INTERVAL = 30000;

const allowedRoutes = [];

// Spot TV
allowedRoutes.push(ROUTES.CONFLICT);
allowedRoutes.push(ROUTES.SETUP);
allowedRoutes.push(ROUTES.UNSUPPORTED_BROWSER);
allowedRoutes.push(ROUTES.HOME);
allowedRoutes.push(ROUTES.OLD_HOME);
allowedRoutes.push(ROUTES.SHARE_HELP);

// Spot Remote
allowedRoutes.push(ROUTES.CODE);
allowedRoutes.push(ROUTES.HELP);

StateListenerRegistry.register((state, prevSelection) => {
    const enableAutoUpdate = isBackendEnabled(state) && Boolean(getPermanentPairingCode(state));
    const currentRoute = getCurrentRoute(state);
    const currentView = getCurrentView(state);

    let isRouteAllowed = allowedRoutes.indexOf(currentRoute) !== -1;

    // Special case for remote-control view
    if (currentRoute === ROUTES.REMOTE_CONTROL && currentView !== 'meeting') {
        isRouteAllowed = true;
    }

    const newSelection = {
        isNightlyReloadTime: isTimeForNightlyReload(state),
        isUpdateAllowed: enableAutoUpdate && isRouteAllowed,
        isWebUpdateAvailable: isWebUpdateAvailable(state)
    };

    return isEqual(newSelection, prevSelection) ? prevSelection : newSelection;
// eslint-disable-next-line no-shadow
}, ({ isNightlyReloadTime, isUpdateAllowed, isWebUpdateAvailable }, { dispatch }) => {
    dispatch(setOkToUpdate(isUpdateAllowed));

    if (isUpdateAllowed && (isWebUpdateAvailable || isNightlyReloadTime)) {
        dispatch(updateWebSource());
    }
});

MiddlewareRegistry.register(({ dispatch, getState }) => next => action => {
    switch (action.type) {
    case BOOTSTRAP_COMPLETE: {
        const state = getState();
        const nightlyReloadTimePoller = new TimeRangePoller({
            endHour: getUpdateEndHour(state),
            startHour: getUpdateStartHour(state),
            frequency: NIGHTLY_RELOAD_POLL_INTERVAL
        });

        nightlyReloadTimePoller.addListener(
            TimeRangePoller.TIME_WITHIN_RANGE_UPDATE,
            isTimeWithinRange => {
                // It's time for a nightly reload if it's been more than 1 day since the last load time
                const lastLoadTime = _getLastLoadTime(getState());

                dispatch(setIsNightlyReloadTime(isTimeWithinRange && !date.isDateForToday(lastLoadTime)));
            }
        );

        nightlyReloadTimePoller.start();

        // Checks for Web updates
        setInterval(() => {
            if (!isWebUpdateAvailable(getState()) && isOkToUpdate(getState())) {
                dispatch(checkForWebUpdateAvailable());
            }
        },
        WEB_UPDATE_POLL_INTERVAL);

        break;
    }
    }

    return next(action);
});
