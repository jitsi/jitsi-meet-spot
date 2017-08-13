const server = require('../../modules/httpcontrol').HttpServer;
const listeningPort = 1025;
const targetPort = 1024;

/**
 * The jitsi-meet api.
 */
let api;

window.onload = function() {
    server.init(listeningPort);
    server.onReceivedCommand((type, args) => {
        handleCommand(type, args);
    });

    document.onkeydown = _onKeyDown;
    document.getElementById('enter_room_button').onclick = function() {
        const roomName = document.getElementById('enter_room_field').value;
        const command = {
            type: 'join',
            args: roomName
        };

        triggerLoader();
        sendHttpCommand(`http://localhost:${targetPort}`, command,
            data => {
                console.log(data);
            }
        );
    };

    /**
     * Listener for Eneter key down event.
     *
     * @param {event} event - key down event
     * @returns {null}
     */
    function _onKeyDown(event) {
        if (event.keyCode === /* Enter */ 13) {
            const roomName = document.getElementById('enter_room_field').value;
            const command = {
                type: 'join',
                args: roomName
            };

            triggerLoader();
            sendHttpCommand(`http://localhost:${targetPort}`, command,
                data => {
                    console.log(data);
                }
            );
        }
    }
};

/**
 * Loads Jitsi-meet page in iframe with given room name.
 *
 * @returns {null}
 */
function triggerLoader() {
    document.onkeydown = null;
    document.getElementById('welcome_page_main').classList.add('animated');
    document.getElementById('welcome_page_main').classList.add('fadeOutUpBig');
    setTimeout(() => {
        document.getElementById('cs-loader-inner')
            .classList.add('cs-loader-inner');
    }, 1000);
}

/**
 * Cteates the iframe that will load Jitsi Meet.
 *
 * @param {string} room - conference room name
 * @returns {null}
 */
function createJitsiIframe(room) {
    const domain = 'meet.jit.si';
    const options = {
        roomName: room,
        width: 800,
        height: 600,
        parentNode: document.querySelector('#meet')
    };

    /* eslint-disable */
    // cannot resolve no-undef error
    api = new JitsiMeetExternalAPI(domain, options);
    /* eslint-enable */
}

/**
 * Handles JitsiMeetExternalAPI command.
 *
 * @param {string} type - command type
 * @param {string} args - arguments for the command
 * @returns {null}
 */
function handleCommand(type, args) {
    switch (type) {
    case 'join': {
        console.log(`Joining conference: ${args}`);
        triggerLoader();
        createJitsiIframe(args);
        break;
    }
    case 'hangup': {
        if (api) {
            console.log('Hanging up...');
            api.executeCommand('hangup');
        } else {
            console.log('API not initialized yet');
        }
        break;
    }
    case 'toggleAudio': {
        if (api) {
            console.log('Toggle Audio');
            api.executeCommand('toggleAudio');
        } else {
            console.log('API not initialized yet');
        }
        break;
    }
    case 'toggleVideo': {
        if (api) {
            console.log('Toggle Video');
            api.executeCommand('toggleVideo');
        } else {
            console.log('API not initialized yet');
        }
        break;
    }
    default:
        console.log(`Bad Request: ${type}`);
    }
}

/**
 * Sends join jitsi-meet conference http request
 *
 * @param {string} url - target server url
 * @param {string} command - command for JitsiMeetExternalAPI
 * @param {Function} callback - callback function
 * @returns {null}
 */
function sendHttpCommand(url, command, callback) {
    const xmlHttp = new XMLHttpRequest();
    const queryString = `${url}?command=${command.type}&args=${command.args}`;

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            callback(xmlHttp.responseText);
        }
    };
    xmlHttp.open('GET', queryString, true); // true for asynchronous
    xmlHttp.send();
}

/**
 * Clears the postis objects and remoteControl.
 *
 * @returns {null}
 */
window.onunload = function() {
    api = null;
};
