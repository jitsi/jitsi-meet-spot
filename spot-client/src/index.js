import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import 'common/css';
import { globalDebugger } from 'common/debugging';
import { LoggingService } from 'common/logger';
import reducers, {
    getDesktopSharingFramerate,
    getLoggingEndpoint,
    setDefaultValues
} from 'common/app-state';
import {
    RemoteControlServiceSubscriber,
    remoteControlService
} from 'common/remote-control';
import {
    generateGuid,
    getPersistedState,
    persistence,
    setPersistedState
} from 'common/utils';

import App from './app';
import PostToEndpoint from './common/logger/post-to-endpoint';

const store = createStore(
    reducers,
    {
        config: {
            ...setDefaultValues(window.JitsiMeetSpotConfig)
        },
        ...getPersistedState()

    }
);
const remoteControlServiceSubscriber = new RemoteControlServiceSubscriber();

globalDebugger.register('store', store);

store.subscribe(() => {
    setPersistedState(store);
    remoteControlServiceSubscriber.onUpdate(store);
});

const reduxState = store.getState();
const loggingEndpoint = getLoggingEndpoint(reduxState);

if (loggingEndpoint) {
    const deviceId = persistence.get('deviceId') || generateGuid();

    persistence.set('deviceId', deviceId);

    const loggingService = new LoggingService(loggingEndpoint);

    loggingService.addHandler(
        new PostToEndpoint({
            deviceId,
            endpointUrl: loggingEndpoint
        })
    );

    loggingService.start();
}

remoteControlService.configureWirelessScreensharing({
    desktopSharingFrameRate: getDesktopSharingFramerate(reduxState)
});

render(
    <Provider store = { store }>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
