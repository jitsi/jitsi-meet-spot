import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createStore } from 'redux';
import thunk from 'redux-thunk';

import 'common/css';
import { SegmentHandler, analytics } from 'common/analytics';
import { globalDebugger } from 'common/debugging';
import { isElectron } from 'common/detection';
import { history } from 'common/history';
import { logger } from 'common/logger';
import reducers, {
    getAnalyticsAppKey,
    getDesktopSharingFramerate,
    getDeviceId,
    getExternalApiUrl,
    routeChanged,
    setBootstrapStarted,
    setDefaultValues,
    setSetupCompleted,
    setStartParams
} from 'common/app-state';
import { setPermanentPairingCode, SpotBackendService } from 'common/backend';
import 'common/i18n';
import { MiddlewareRegistry, ReducerRegistry, StateListenerRegistry } from 'common/redux';
import {
    RemoteControlServiceSubscriber,
    remoteControlClient
} from 'common/remote-control';
import {
    getPersistedState,
    loadScript,
    setPersistedState
} from 'common/utils';

import { ExternalApiSubscriber } from 'spot-remote/external-api';

import App from './app';

const queryParams = new URLSearchParams(window.location.search);

const store = createStore(
    ReducerRegistry.combineReducers(reducers),
    {
        config: {
            ...setDefaultValues(window.JitsiMeetSpotConfig)
        },
        spotTv: {

            // Will get overridden on Spot-Remote by Spot-TV updates.
            electron: isElectron()
        },
        ...getPersistedState()
    },
    MiddlewareRegistry.applyMiddleware(thunk)
);

// StateListenerRegistry
StateListenerRegistry.subscribe(store);

const remoteControlServiceSubscriber = new RemoteControlServiceSubscriber();


const externalApiSubscriber = new ExternalApiSubscriber(message => {
    const externalListener = window.opener
        || (window.parent === window ? null : window.parent);

    externalListener && externalListener.postMessage(message, '*');
});

globalDebugger.register('store', store);

store.subscribe(() => {
    setPersistedState(store);

    const newReduxState = store.getState();

    remoteControlServiceSubscriber.onUpdate(newReduxState);
    externalApiSubscriber.onUpdate(newReduxState);
});

// Allow selenium tests to skip the setup flow.
const testRefreshToken = queryParams.get('testBackendRefreshToken');

if (testRefreshToken) {
    // Permanent paring code is required to get through intermediate layers down to the backend service.
    // When refresh token is stored the paring code is not really used. This eventually should be refactored in
    // future to check for refresh token rather than rely on the permanent pairing code being present.
    // Here come up with just any permanent code, because it doesn't matter.
    const permanentPairingCode = '12345678';

    SpotBackendService.injectTestRefreshToken(permanentPairingCode, testRefreshToken);

    store.dispatch(setPermanentPairingCode(permanentPairingCode));
    store.dispatch(setSetupCompleted());
}

store.dispatch(setBootstrapStarted());

const reduxState = store.getState();
const deviceId = getDeviceId(reduxState);
const analyticsAppKey = getAnalyticsAppKey(reduxState);

if (analyticsAppKey) {
    analytics.addHandler(new SegmentHandler(deviceId, analyticsAppKey));
}

// eslint-disable-next-line max-params
window.onerror = (message, url, lineNo, columnNo, error) => {
    logger.error('Uncaught error', {
        columnNo,
        lineNo,
        message: message || (error && error.message),
        error: error && error.stack,
        url
    });
};

window.onunhandledrejection = event => {
    if (event.reason instanceof Error) {
        const { message, stack } = event.reason;

        logger.error('Unhandled promise rejection', {
            message,
            stack
        });

        return;
    }

    logger.error('Unhandled promise rejection', {
        message: event.reason,
        stack: 'n/a'
    });
};

remoteControlClient.configureWirelessScreensharing({
    desktopSharingFrameRate: getDesktopSharingFramerate(reduxState)
});

history.listen(location => {
    store.dispatch(routeChanged(location));
});

/**
 * Persisting query params.
 */
const rawParamsObject = {};

for (const [ key, value ] of queryParams.entries()) {
    rawParamsObject[key] = value;
}

store.dispatch(setStartParams(rawParamsObject));

loadScript(getExternalApiUrl(reduxState))
    .then(() => {
        render(
            <Provider store = { store }>
                <Router history = { history }>
                    <App />
                </Router>
            </Provider>,
            document.getElementById('root')
        );
    });
