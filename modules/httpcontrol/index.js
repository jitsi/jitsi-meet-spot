/* eslint-disable */
const {EventEmitter} = require('events');
const util = require('util');

/**
 * Receives http requests from another peer.
 */
class HttpServer extends EventEmitter {
    /**
     * Construcs new instance.
     * @constructor
     */
    constructor() {
        super();
        this.started = false;
        this.server = null;
        this.io = null;
        EventEmitter.call(this);
    }

    /**
     * Initializes the http server.
     * @param {integer} port - listening port for http server
     */
    init (port) {
        const _this = this;
        this.started = true;
        this.server = require('http').createServer( (req, res) => {
            if (this.started) {
                console.log("HTTP request received");
                console.log(JSON.stringify(req));
                res.writeHead(200);
                res.end("Server OK");
            } else {
                console.log()
                res.writeHead(503);
                res.end("Service Unavailable")
            }
        });
        this.io = require('socket.io')(this.server);

        this.server.listen(port, () => {
            console.log('Server listening at port %d', port);
        });

        this.io.on('connection', (socket) => {
            if (this.started) {
                console.log('Client connected');
                socket.on('enter-room', (roomName) => {
                    _this.emit('enter-room', roomName);
                });
                socket.emit('connected', 'you have been connected.');
            }
        });
    }

    /**
     * Starts processing the events.
     */
    start() {
        this.started = true;
    }

    /**
     * Stops processing the events.
     */
    stop() {
        this.started = false;
    }

    /**
     * Event listener for join conference request.
     */
    onJoinConferenceRequest (callback) {
        return this.on('enter-room', (roomName) => {
            callback(roomName);
        });
    }

    /**
     * Disposes the http server.
     */
    dispose () {
        this.started = false;
        this.server = null;
        this.io = null;
        this.removeListener('client-connected');
        this.removeListener('enter-room');
    }
}

/**
 * Receives http requests from another peer.
 */
class HttpClient extends EventEmitter {
    /**
     * Construcs new instance.
     * @constructor
     */
    constructor () {
        super();
        this.io = null;
        this.socket = null;
        EventEmitter.call(this);
    }

    /**
     * Sends join conference http request.
     * @param {string} targetURL - target url for conference request
     * @param {string} roomName - room name for conference
     */
    sendJoinConferenceRequest (targetURL, roomName) {
        const _this = this;
        this.io = require('socket.io-client');
        this.socket = this.io.connect(targetURL);
        this.socket.on('connect', () => {
            console.log('client-side socket connected');
            _this.emit('socketConnected');
            _this.socket.emit('enter-room', roomName);
        });
        this.socket.on('connected', (message) => {
            console.log("Message: " + message);
        });
    }

    /**
     * Event listener for http connection.
     */
    onConnectionEstablisehd (callback) {
        return this.on('socketConnected', () => {
            callback();
        }) ;
    }

    /**
     * Disposes the http client.
     */
    dispose () {
        this.io = null;
        this.socket = null;
        this.removeListener('socketConnected');
    }
}

module.exports.HttpServer = new HttpServer();
module.exports.HttpClient = new HttpClient();