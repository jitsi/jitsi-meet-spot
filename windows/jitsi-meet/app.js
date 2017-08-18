import ReactDom from 'react-dom';

import http from '../../modules/httpcontrol';
import handleCommand from '../../modules/commandhandler';
import config from '../../config.js';
/*eslint-disable*/
//Error message: 'App' is defined but never used
import App from '../../components';
/*eslint-enable*/

const listeningPort = config.PORT;

window.onload = function() {
    ReactDom.render(
        <App />,
        document.getElementById('app')
    );

    http.init(listeningPort);
    http.start();
    http.onReceivedCommand((type, args) => {
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
