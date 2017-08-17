const config = require('../../config.js');

/**
 * The jitsi-meet api.
 */
let api;

/**
 * Handles JitsiMeetExternalAPI command.
 *
 * @param {string} type - command type
 * @param {string} args - arguments for the command
 * @returns {string} execution status message
 */
function handleCommand(type, args) {
    if (api) {
        switch (type) {
        case 'join': {
            console.log('Conference already exists');
            throw new Error('Fail: You are already in conference\n');
        }
        case 'hangup': {
            console.log('Hanging up...');
            api.executeCommand('hangup');

            return 'Success: Conference hung up\n';
        }
        case 'toggleAudio': {
            console.log('Toggle Audio');
            api.executeCommand('toggleAudio');

            return 'Success: Audio toggled\n';
        }
        case 'toggleVideo': {
            console.log('Toggle Video');
            api.executeCommand('toggleVideo');

            return 'Success: Video toggled\n';
        }
        default:
            console.log(`Bad Request: ${type}`);
            throw new Error('Fail: Unkown command\n');
        }
    } else if (type === 'join') {
        console.log(`Joining conference: ${args}`);
        createJitsiIframe(args);

        return `Success: Joined conference room: ${args}\n`;
    } else {
        console.log('API not initialized yet');
        throw new Error('Fail: You are not in conference yet\n');
    }
}

/**
 * Creates the iframe that will load Jitsi Meet.
 *
 * @param {string} room - conference room name
 * @returns {null}
 */
function createJitsiIframe(room) {
    const options = {
        roomName: room,
        width: 800,
        height: 600,
        parentNode: document.querySelector('#meet')
    };

    api = new JitsiMeetExternalAPI(config.JITSI_MEET_DOMAIN, options);
}

module.exports = handleCommand;
