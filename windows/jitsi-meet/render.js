const http = require('../../modules/httpcontrol');
const handleCommand = require('../../modules/commandhandler');
const config = require('../../config.js');
const listeningPort = config.PORT;

window.onload = function() {
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
 * @returns {null}
 */
window.onunload = function() {
    http.dispose();
};
