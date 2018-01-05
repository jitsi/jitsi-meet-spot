import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { protoState } from 'reducers';
import { getPersistedState, setPersistedState } from 'utils';

import App from './app';

import 'reset.css';

const store = createStore(protoState, getPersistedState());

store.subscribe(() => {
    setPersistedState(store);
});

window.debug = {
    store
};

render(
    <Provider store = { store }>
        <HashRouter>
            <App />
        </HashRouter>
    </Provider>,
    document.getElementById('root')
);
