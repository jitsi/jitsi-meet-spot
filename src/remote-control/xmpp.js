/* global JitsiMeetJS */

import { XMPP_CONFIG } from 'config';
import { $msg } from 'strophe.js';
import { logger, persistence } from 'utils';
import { setLocalRemoteControlID } from 'actions';

let commandListeners = [];
let initPromise;
let xmppConnection;

const xmppControl = {
    init(dispatch) {
        if (initPromise) {
            return;
        }

        initPromise = JitsiMeetJS.init({})
            .then(() => {
                JitsiMeetJS.setLogLevel('error');
                xmppConnection
                    = new JitsiMeetJS.JitsiConnection(null, null, XMPP_CONFIG);

                xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                    () => {
                        dispatch(setLocalRemoteControlID(this.getJid()));
                    });

                xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_FAILED,
                    logger.error);

                xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
                    logger.error);

                xmppConnection.xmpp.connection.addHandler(
                    onCommand,
                    null,
                    'message',
                    null,
                    null
                );

                xmppConnection.connect();
            });
    },

    addCommandListener(callback) {
        commandListeners.push(callback);
    },

    getJid() {
        return xmppConnection.xmpp.connection.jid;
    },

    removeCommandListener(callback) {
        commandListeners = commandListeners.filter(cb => cb !== callback);
    },

    sendCommand(jid, command, options = {}) {
        const message = $msg({
            to: jid,
            type: 'spot-command'
        });

        message.c('body', command).up();
        message.c('options', JSON.stringify(options)).up();

        xmppConnection.xmpp.connection.send(message);
    },

    _getConnection() {
        return xmppConnection;
    }
};

function onCommand(message) {
    if (message.getAttribute('type') !== 'spot-command') {
        return true;
    }

    const body = message.getElementsByTagName('body')[0];
    const options = message.getElementsByTagName('options')[0];

    if (body && body.textContent) {
        commandListeners.forEach(cb =>
            cb(body.textContent, JSON.parse(options.textContent)));
    }

    return true;
}

export default xmppControl;
