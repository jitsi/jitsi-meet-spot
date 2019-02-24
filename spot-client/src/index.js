import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { createHashHistory } from 'history';

import 'common/css';
import { LoggingService } from 'common/logger';
import reducers, { getLoggingEndpoint } from 'common/app-state';
import {
    ProcessUpdateDelegate,
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
            ...window.JitsiMeetSpotConfig
        },
        ...getPersistedState()

    }
);

store.subscribe(() => {
    setPersistedState(store);
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

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'production') {
    window.spot = {
        remoteControlService,
        store
    };
}

const history = createHashHistory();

remoteControlService.configureWirelessScreensharing({
    desktopSharingFrameRate: {
        max: window.JitsiMeetSpotConfig.MEDIA.WIRELESS_SS_MAX_FPS
    }
});
remoteControlService.setDelegate(new ProcessUpdateDelegate(store, history));

render(
    <Provider store = { store }>
        <HashRouter>
            <App />
        </HashRouter>
    </Provider>,
    document.getElementById('root')
);
