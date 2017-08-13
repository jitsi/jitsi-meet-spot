const http = require('../../modules/httpcontrol');
const listeningPort = 1024;
const targetPort = 1025;

/**
 * The jitsi-meet api.
 */
let api;

window.onload = function() {
    http.init(listeningPort);
    http.onReceivedCommand((type, args) => {
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
        http.sendHttpCommand(`http://localhost:${targetPort}`, command,
            data => {
                console.log(data);
            }
        );
    };

    /**
     * Listener for Eneter key down event.
     * For testing purpose
     *
     * @param {event} event - key down event
     * @returns {null}
     */
    function _onKeyDown(event) {
        if (event.keyCode === /* Enter */ 13) {
            const input = document.getElementById('enter_room_field').value;

            switch (input) {
            case 'toggleAudio': {
                const command = {
                    type: 'toggleAudio'
                };

                console.log('toggleAudio');
                http.sendHttpCommand(`http://localhost:${targetPort}`, command,
                    data => {
                        console.log(data);
                    }
                );
                break;
            }
            case 'toggleVideo': {
                const command = {
                    type: 'toggleVideo'
                };

                console.log('toggleVideo');
                http.sendHttpCommand(`http://localhost:${targetPort}`, command,
                    data => {
                        console.log(data);
                    }
                );
                break;
            }
            case 'hangup': {
                const command = {
                    type: 'hangup'
                };

                console.log('hangup');
                http.sendHttpCommand(`http://localhost:${targetPort}`, command,
                    data => {
                        console.log(data);
                    }
                );
                break;
            }
            default: {
                const command = {
                    type: 'join',
                    args: input
                };

                console.log('join');
                http.sendHttpCommand(`http://localhost:${targetPort}`, command,
                    data => {
                        console.log(data);
                    }
                );
            }
            }
        }
    }
};

/**
 * Trigger loadding screen.
 *
 * @returns {null}
 */
function triggerLoader() {
    // document.onkeydown = null;
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
 * Clears the postis objects and remoteControl.
 *
 * @returns {null}
 */
window.onunload = function() {
    api = null;
};
