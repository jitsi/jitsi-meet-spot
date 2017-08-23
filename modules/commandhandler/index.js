/* global JitsiMeetExternalAPI */
import load from 'load-script2';
import config from '../../config.js';

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
            api.dispose();
            api = null;

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
        case 'toggleFilmStrip': {
            console.log('Toggle Film Strip');
            api.executeCommand('toggleFilmStrip');

            return 'Success: Film strip toggled\n';
        }
        case 'toggleChat': {
            console.log('Toggle Chat');
            api.executeCommand('toggleChat');

            return 'Success: Chat toggled\n';
        }
        case 'toggleContactList': {
            console.log('Toggle Contact List');
            api.executeCommand('toggleContactList');

            return 'Success: Contact list toggled\n';
        }
        default:
            console.log(`Bad Request: ${type}`);
            throw new Error('Fail: Unkown command\n');
        }
    } else if (type === 'join') {
        console.log(`Joining conference: ${args}`);
        try {
            createJitsiIframe(args);
        } catch (err) {
            return `Error loading Jitsi external api script: ${err}`;
        }

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
 * @returns {void}
 */
function createJitsiIframe(room) {
    load(config.EXTERNAL_API_DOMAIN, err => {
        if (err) {
            return err;
        }
        const options = {
            roomName: room,
            width: 800,
            height: 600,
            parentNode: document.querySelector('#meet')
        };

        api = new JitsiMeetExternalAPI(config.JITSI_MEET_DOMAIN, options);
    });
}

export default handleCommand;
