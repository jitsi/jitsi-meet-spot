import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { createHashHistory } from 'history';

import 'common/css';
import { LoggingService } from 'common/logger';
import { protoState } from 'common/reducers';
import {
    ProcessUpdateDelegate,
    remoteControlService
} from 'common/remote-control';
import { getPersistedState, setPersistedState } from 'common/utils';

import App from './app';

const loggingService = new LoggingService();

loggingService.start();

const store = createStore(
    protoState,
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


// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'production') {
    window.spot = {
        remoteControlService,
        store
    };
}

const history = createHashHistory();

remoteControlService.setDelegate(new ProcessUpdateDelegate(store, history));

render(
    <Provider store = { store }>
        <HashRouter>
            <App />
        </HashRouter>
    </Provider>,
    document.getElementById('root')
);
