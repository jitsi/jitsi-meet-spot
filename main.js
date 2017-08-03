/* eslint-disable */
const electron = require("electron");
const {app} = electron;
const APP = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");

const port = 1024;
const theOtherPort = 1025;

/**
 * URL for index.html which will be our entry point.
 */
const indexURL = url.format({
    pathname: path.join(__dirname, "windows", "jitsi-meet", "index.html"),
    protocol: "file:",
    slashes: true
});

/**
 * The window object that will load the iframe with Jitsi Meet.
 * IMPORTANT: Must be defined as global in order to not be garbage collected
 * acidentally.
 */
let jitsiMeetWindow = null;

/**
 * Options used when creating the main Jitsi Meet window.
 */
const jitsiMeetWindowOptions = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden'
};

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

//server
function setUpHttpServer () {
    jitsiMeetWindow = new BrowserWindow(jitsiMeetWindowOptions);
    jitsiMeetWindow.loadURL(indexURL);



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
        console.log("server-side socket connected")
        socket.emit('connected', 'you have been connected.');
        socket.on('enter-room', function (roomName) {
            console.log("Connect to https://meet.jit.si/" + roomName);
            jitsiMeetWindow.send('enter-room', roomName);
        });
    });
}

//client
function sendHttpRequest (roomName) {
    const {net} = require('electron');
    const request = net.request('http://localhost:'+theOtherPort);
    const socket = require('socket.io-client')('http://localhost:'+theOtherPort);


    request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        response.on('end', () => {
            console.log('No more data in response.')
        });

        socket.on('connect', () => {
            console.log('client-side socket connected')
            socket.emit('enter-room', roomName);
        });
        socket.on('connected', (message) => {
            console.log("Message: " + message);
        });
    })
    request.end();
}

//Start the application:
setAPPListeners();

const ipcMain = require('electron').ipcMain;
ipcMain.on('sendRequest', (event, roomName) => {
    sendHttpRequest(roomName);
});