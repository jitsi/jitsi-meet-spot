import React from 'react';
import ReactDom from 'react-dom';

import HttpControl from '../../modules/httpcontrol';
import handleCommand from '../../modules/commandhandler';
import config from '../../config.js';
import App from '../../components';

const LISTENING_PORT = config.PORT;
let http;

window.onload = function() {
    ReactDom.render(
        <App />,
        document.getElementById('app')
    );

    http = new HttpControl(LISTENING_PORT);

    http.on('command', (type, args) => {
        try {
            const message = handleCommand(type, args);

            http.sendResponse(true, message);
        } catch (error) {
            http.sendResponse(false, error.message);
        }
    });
};

/**
 * Clears http server.
 *
 * @returns {void}
 */
window.onunload = function() {
    http.dispose();
};
