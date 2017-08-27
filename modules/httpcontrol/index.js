import { EventEmitter } from 'events';
import http from 'http';
import querystring from 'querystring';
import Logger from 'jitsi-meet-logger';

const logger = Logger.getLogger();

logger.setLevel(Logger.levels.debug);

/**
 * Receives http requests from another peer.
 */
class HttpControl extends EventEmitter {
    /**
     * Construcs new instance.
     * 
     * @param {integer} port - listening port for http server
     * @class
     */
    constructor(port) {
        super();
        this.server = http.createServer((req, res) => {
            /*  HTTP request format: 
    curl --data "command=<command.type>&args=<arguments>" <targetURL>
                */
            logger.log('HTTP request received');
            let body = '';
            let query;

            req.on('data', data => {
                body += data;
            });
            req.on('end', () => {
                query = querystring.parse(body);
                this.on('response', (success, message) => {
                    if (success) {
                        logger.log(message);
                        res.writeHead(200);
                        res.end(message);
                    } else {
                        logger.error(message);
                        res.writeHead(400);
                        res.end(message);
                    }
                });

                this.emit('command', query.command, query.args);
            });
        });
        this.server.listen(port, () => {
            logger.log('Server listening at port %d', port);
        });
    }

    /**
     * Event listener for join conference request.
     * 
     * @param {Function} callback - callback function
     * @returns {void}
     */
    onReceivedCommand(callback) {
        return this.on('command', (type, args) => {
            callback(type, args);
        });
    }

    /**
     * Send command execution result to the client.
     *
     * @param {boolean} status - true if execution is success
     * @param {string} message - response messsage
     * @returns {void}
     */
    sendResponse(status, message) {
        this.emit('response', status, message);
    }

    /**
     * Disposes the http server.
     * 
     * @returns {void}
     */
    dispose() {
        this.server = null;
        this.removeListener('command');
        this.removeListener('response');
    }
}

export default HttpControl;
