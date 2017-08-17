const EventEmitter = require('events').EventEmitter;
const http = require('http');
const qs = require('querystring');

/**
 * Receives http requests from another peer.
 */
class HttpControl extends EventEmitter {
    /**
     * Construcs new instance.
     * 
     * @class
     */
    constructor() {
        super();
        this.started = false;
        this.server = null;
    }

    /**
     * Initializes the http server.
     * 
     * @param {integer} port - listening port for http server
     * @returns {null}
     */
    init(port) {
        this.server = http.createServer((req, res) => {
            if (this.started) {
                /*  HTTP request format: 
        curl --data "command=<command.type>&args=<arguments>" <targetURL>
                 */
                console.log('HTTP request received');
                let body = '';
                let query;

                req.on('data', data => {
                    body += data;
                });
                req.on('end', () => {
                    query = qs.parse(body);
                    console.log('Received request: ');
                    console.log(query);

                    this.on('response', (success, message) => {
                        if (success) {
                            console.log('Command execution success');
                            res.writeHead(200);
                            res.end(message);
                        } else {
                            console.log('Command execution failed');
                            res.writeHead(400);
                            res.end(message);
                        }
                    });

                    this.emit('command', query.command, query.args);
                });
            } else {
                console.log('Server disabled');
                res.writeHead(503);
                res.end('Service Unavailable\n');
            }
        });
        this.server.listen(port, () => {
            console.log('Server listening at port %d', port);
        });
    }

    /**
     * Starts processing the events.
     * 
     * @returns {null}
     */
    start() {
        this.started = true;
    }

    /**
     * Stops processing the events.
     * 
     * @returns {null}
     */
    stop() {
        this.started = false;
    }

    /**
     * Event listener for join conference request.
     * 
     * @param {Function} callback - callback function
     * @returns {null}
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
     * @returns {null}
     */
    sendResponse(status, message) {
        this.emit('response', status, message);
    }

    /**
     * Disposes the http server.
     * 
     * @returns {null}
     */
    dispose() {
        this.started = false;
        this.server = null;
        this.removeListener('command');
        this.removeListener('response');
    }
}

module.exports = new HttpControl();
