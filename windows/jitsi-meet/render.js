/* eslint-disable */
const ipcRenderer = require('electron').ipcRenderer;

/**
 * The postis channel.
 */
let channel;

/**
 * The jitsi-meet iframe.
 */
let iframe;

window.onload = function() {
    document.onkeydown = _onKeyDown;
    document.getElementById("enter_room_button").onclick = function() {
        const roomName = document.getElementById("enter_room_field").value;
        triggerLoader();
        ipcRenderer.send('sendRequest', roomName);
    };
    function _onKeyDown (event) {
        if (event.keyCode === /* Enter */ 13) {
            const roomName = document.getElementById("enter_room_field").value;
            triggerLoader();
            ipcRenderer.send('sendRequest', roomName);
        }
    }

    ipcRenderer.on('enter-room', (event, roomName) => {
        triggerLoader();
        createJitsiIframe(roomName);
    });
};

/**
 * Loads Jitsi-meet page in iframe with given room name.
 */
function triggerLoader (roomName) {
    document.onkeydown = null;
    document.getElementById("welcome_page_main").classList.add("animated");
    document.getElementById("welcome_page_main").classList.add("fadeOutUpBig");
    setTimeout(function() {
        document.getElementById("cs-loader-inner").classList.add("cs-loader-inner");
    }, 1000);
}

/**
 * Cteates the iframe that will load Jitsi Meet.
 */
function createJitsiIframe(roomName) {
    iframe = document.createElement('iframe');
    iframe.src = "https://meet.jit.si/" + roomName;
    iframe.allowFullscreen = true;
    iframe.onload = onload;
    document.body.appendChild(iframe);
}

/**
 * Clears the postis objects and remoteControl.
 */
function onunload() {
    channel.destroy();
    channel = null;
    remoteControl.dispose();
}
