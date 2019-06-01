import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createStore } from 'redux';
import thunk from 'redux-thunk';

import 'common/css';
import { SegmentHandler, analytics } from 'common/analytics';
import { globalDebugger } from 'common/debugging';
import { history } from 'common/history';
import { LoggingService, logger } from 'common/logger';
import reducers, {
    getAnalyticsAppKey,
    getDesktopSharingFramerate,
    getLoggingEndpoint,
    setDefaultValues
} from 'common/app-state';
import { MiddlewareRegistry, ReducerRegistry } from 'common/redux';
import {
    RemoteControlServiceSubscriber,
    remoteControlClient
} from 'common/remote-control';
import {
    getDeviceId,
    getPersistedState,
    isElectron,
    setPersistedState
} from 'common/utils';

import App from './app';
import PostToEndpoint from './common/logger/post-to-endpoint';

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

globalDebugger.register('store', store);

store.subscribe(() => {
    setPersistedState(store);
    remoteControlServiceSubscriber.onUpdate(store);
});

const reduxState = store.getState();
const deviceId = getDeviceId();
const analyticsAppKey = getAnalyticsAppKey(reduxState);

if (analyticsAppKey) {
    analytics.addHandler(new SegmentHandler(deviceId, analyticsAppKey));
}

window.onerror = message => logger.error('Uncaught error', { message });

window.onunhandledrejection = event => {
    const { message, stack } = event.reason || {};

    logger.error('Unhandled promise rejection', {
        message,
        stack
    });
};

const loggingEndpoint = getLoggingEndpoint(reduxState);

if (loggingEndpoint) {
    const loggingService = new LoggingService(loggingEndpoint);

    loggingService.addHandler(
        new PostToEndpoint({
            deviceId,
            endpointUrl: loggingEndpoint
        })
    );

    loggingService.start();
}

remoteControlClient.configureWirelessScreensharing({
    desktopSharingFrameRate: getDesktopSharingFramerate(reduxState)
});

render(
    <Provider store = { store }>
        <Router history = { history }>
            <App />
        </Router>
    </Provider>,
    document.getElementById('root')
);
