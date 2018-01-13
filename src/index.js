import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { protoState } from 'reducers';
import { getPersistedState, setPersistedState } from 'utils';
import { remoteControlService } from 'remote-control';

import App from './app';
import './reset.css';

const store = createStore(protoState, getPersistedState());

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

render(
    <Provider store = { store }>
        <HashRouter>
            <App />
        </HashRouter>
    </Provider>,
    document.getElementById('root')
);
