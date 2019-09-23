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
    setSetupCompleted
} from 'common/app-state';
import { setPermanentPairingCode } from 'common/backend';
import { MiddlewareRegistry, ReducerRegistry } from 'common/redux';
import {
    RemoteControlServiceSubscriber,
    remoteControlClient
} from 'common/remote-control';
import {
    clearPersistedState,
    getPersistedState,
    loadScript,
    setPersistedState
} from 'common/utils';

import { disconnectFromSpotTV } from 'spot-remote/app-state';
import { ExternalApiSubscriber } from 'spot-remote/external-api';
import { disconnectSpotTvRemoteControl } from './spot-tv/app-state';

import App from './app';

const queryParams = new URLSearchParams(window.location.search);

// On Aug 22, 2019, this param is used by old spot-controllers. Remove this code
// after some time.
if (queryParams.get('reset') === 'true') {
    clearPersistedState();
}

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
if (queryParams.get('testPermanentPairingCode')) {
    store.dispatch(setPermanentPairingCode(queryParams.get('testPermanentPairingCode')));
    store.dispatch(setSetupCompleted());
}

store.dispatch(setBootstrapStarted());

const reduxState = store.getState();
const deviceId = getDeviceId(reduxState);
const analyticsAppKey = getAnalyticsAppKey(reduxState);

if (analyticsAppKey) {
    analytics.addHandler(new SegmentHandler(deviceId, analyticsAppKey));
}

window.addEventListener(
    'beforeunload',
    event => {
        store.dispatch(disconnectSpotTvRemoteControl(event)).catch(error => {
            console.error('Failed to disconnect Spot TV on unload', error);
        });
        store.dispatch(disconnectFromSpotTV(event));
    }
);

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
