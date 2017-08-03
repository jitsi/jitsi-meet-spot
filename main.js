/* eslint-disable */
const electron = require("electron");
const {app} = electron;
const APP = electron.app;
const BrowserWindow = electron.BrowserWindow;

const port = 1024;

/**
 * Sets the APP object listeners.
 */
function setAPPListeners () {
    APP.on("ready", setUpHttpServer);
    APP.on("activate", () => {
        if (jitsiMeetWindow === null) {
            setUpHttpServer();
        }
    });
    APP.on("window-all-closed", () => {
        // Don"t quit the application for Mac OS
        if (process.platform !== "darwin") {
            APP.quit();
        }
    });
}

function setUpHttpServer() {
    const server = require('http').createServer(handler);
    const io = require('socket.io')(server);

    server.listen(port, function () {
        console.log('Server listening at port %d', port);
    });

    function handler (req, res) {
        res.writeHead(200);
        res.end("Connected")
    }

    io.on('connection', function (socket) {
        socket.emit('connected', 'you have been connected.');
        socket.on('enter-room', function (roomName) {
            console.log("Connect to https://meet.jit.si/" + roomName);
        });
    });
}

function sendHttpRequest() {
    const {net} = require('electron');
    const request = net.request('http://localhost:'+port);
    const socket = require('socket.io-client')('http://localhost:'+port);

    request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        response.on('end', () => {
            console.log('No more data in response.')
        });

        socket.on('connected', (message) => {
            console.log("Message: " + message);
        });
        socket.emit('enter-room', 'testRoomName');
    })
    request.end();
}

//Start the application:
setAPPListeners();
