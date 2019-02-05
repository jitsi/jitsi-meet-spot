import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { createHashHistory } from 'history';

import { NoSleep } from 'no-sleep';
import { protoState } from 'reducers';
import { ProcessUpdateDelegate, remoteControlService } from 'remote-control';
import { getPersistedState, setPersistedState } from 'utils';

import App from './app';
import './css';

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

/**
 * Defer touch actions to web to handle.
 */
document.addEventListener('touchstart', () => { /** no op */ }, true);

render(
    <Provider store = { store }>
        <HashRouter>
            <NoSleep>
                <App />
            </NoSleep>
        </HashRouter>
    </Provider>,
    document.getElementById('root')
);
