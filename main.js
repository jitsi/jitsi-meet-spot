/* eslint-disable */
const electron = require("electron");
const {app} = electron;
const APP = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;

const path = require("path");
const url = require("url");

const listeningPort = 1024;
const targetPort = 1025;

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

    const server = require('./modules/httpcontrol').HttpServer;
    server.init(listeningPort);
    server.onJoinConferenceRequest( (roomName) => {
        console.log("Connect to https://meet.jit.si/" + roomName);
        jitsiMeetWindow.send('enter-room', roomName);
    });
}

//client
ipcMain.on('sendRequest', (event, roomName) => {
    sendHttpRequest(roomName);
});

function sendHttpRequest (roomName) {
    const client = require('./modules/httpcontrol').HttpClient;
    client.sendJoinConferenceRequest('http://localhost:'+targetPort, roomName);
    client.onConnectionEstablisehd ( () => {
        console.log('Connection Established');
    });
}

//Start the application:
setAPPListeners();

