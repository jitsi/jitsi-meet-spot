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
 * @param {string} command - command type
 * @param {string} args - arguments for the command
 * @returns {string} execution status message
 */
function handleCommand(command, args) {
    if (!api) {
        if (command === 'join') {
            try {
                createJitsiIframe(args);

                return `Conference joined: ${args}\n`;
            } catch (err) {
                return `Error loading Jitsi external api script: ${err}\n`;
            }
        }

        return 'There is no conference\n';
    } else if (command === 'join') {
        return 'Error: You are already in conference\n';
    }
    api.executeCommand(command, args);

    return `Success: ${command}\n`;
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
            width: '100%',
            height: '100%',
            parentNode: document.querySelector('#meet')
        };

        api = new JitsiMeetExternalAPI(config.JITSI_MEET_DOMAIN, options);
    });
}

export default handleCommand;
