import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { protoState } from 'reducers';
import { remoteControlService } from 'remote-control';
import { getPersistedState, setPersistedState } from 'utils';

import App from './app';
import './reset.css';

// FIXME: I honestly don't know how to load this font through css-modules so
// I copied from https://github.com/css-modules/css-modules/issues/164
import '!style-loader!css-loader!fonts/fonts.css';

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
