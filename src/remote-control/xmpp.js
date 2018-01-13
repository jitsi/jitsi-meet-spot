/* global JitsiMeetJS */

import { XMPP_CONFIG } from 'config';
import { $msg } from 'strophe.js';
import { logger, persistence } from 'utils';

let commandListeners = [];
let initPromise;
let xmppConnection;


const skipDebugStoring = window.location.href.includes('remote-control-debug');

const xmppControl = {
    init() {
        if (initPromise) {
            return;
        }

        initPromise = JitsiMeetJS.init({})
            .then(() => {
                xmppConnection
                    = new JitsiMeetJS.JitsiConnection(null, null, XMPP_CONFIG);

                xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                    () => {
                        if (!skipDebugStoring) {
                            persistence.set('debug-jid', this.getJid());
                        }
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

    sendCommand(jid, command) {
        const message = $msg({
            to: jid,
            type: 'spot-command'
        });

        message.c('body', command).up();

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

    if (body && body.textContent) {
        commandListeners.forEach(cb => cb(body.textContent));
    }

    return true;
}

export default xmppControl;
