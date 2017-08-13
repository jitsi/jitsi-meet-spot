const EventEmitter = require('events').EventEmitter;
const url = require('url');


/**
 * Receives http requests from another peer.
 */
class HttpServer extends EventEmitter {
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
        const self = this;

        this.started = true;
        this.server = require('http').createServer((req, res) => {
            if (this.started) {
                console.log('HTTP request received');
                const queryData = url.parse(req.url, true).query;

                console.log('Received request: ');
                console.log(queryData);
                self.emit('command', queryData.command, queryData.args);
                res.writeHead(200);
                res.end('Server OK');
            } else {
                console.log('Server disabled');
                res.writeHead(503);
                res.end('Service Unavailable');
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
     * Disposes the http server.
     * 
     * @returns {null}
     */
    dispose() {
        this.started = false;
        this.server = null;
        this.removeListener('command');
    }
}

module.exports.HttpServer = new HttpServer();
