
import type { RootState } from 'common/app-state';
import {
    BOOTSTRAP_COMPLETE,
    getCurrentRoute,
    getCurrentView,
    getUpdateEndHour,
    getUpdateStartHour
} from 'common/app-state';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { date } from 'common/date';
import { MiddlewareRegistry, StateListenerRegistry } from 'common/redux';
import { ROUTES } from 'common/routing';
import isEqual from 'lodash.isequal';

import TimeRangePoller from './TimeRangePoller';
import {
    checkForWebUpdateAvailable,
    setIsNightlyReloadTime,
    setOkToUpdate,
    updateWebSource
} from './actions';
import {
    _getLastLoadTime,
    isOkToUpdate,
    isTimeForNightlyReload,
    isWebUpdateAvailable
} from './selectors';

/**
 * How often the controller checks if it's the nightly reload time.
 */
export const NIGHTLY_RELOAD_POLL_INTERVAL = 30000;

/**
 * How often the check for web source update happens.
 */
export const WEB_UPDATE_POLL_INTERVAL = 30000;

const allowedRoutes: string[] = [];

// Spot TV
allowedRoutes.push(ROUTES.SETUP);
allowedRoutes.push(ROUTES.UNSUPPORTED_BROWSER);
allowedRoutes.push(ROUTES.HOME);
allowedRoutes.push(ROUTES.OLD_HOME);
allowedRoutes.push(ROUTES.SHARE_HELP);

// Spot Remote
allowedRoutes.push(ROUTES.CODE);
allowedRoutes.push(ROUTES.HELP);

StateListenerRegistry.register((state: RootState, prevSelection: any) => {
    const enableAutoUpdate = isBackendEnabled(state) && Boolean(getPermanentPairingCode(state));
    const currentRoute = getCurrentRoute(state);
    const currentView = getCurrentView(state);

    let isRouteAllowed = currentRoute !== undefined && allowedRoutes.indexOf(currentRoute) !== -1;

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

 
}, ({ isNightlyReloadTime, isUpdateAllowed, isWebUpdateAvailable }: any, { dispatch }: any) => {
    dispatch(setOkToUpdate(isUpdateAllowed));

    if (isUpdateAllowed && (isWebUpdateAvailable || isNightlyReloadTime)) {
        dispatch(updateWebSource());
    }
});

MiddlewareRegistry.register(({ dispatch, getState }: any) => (next: any) => (action: any) => {
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
            (isTimeWithinRange: boolean) => {
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
