/* global JitsiMeetJS */

import config from 'config';
import { $msg } from 'strophe.js';
import { logger } from 'utils';
import { setLocalRemoteControlID } from 'actions';

let commandListeners = [];
let presenceListeners = [];
let initPromise;

const xmppControl = {
    init(dispatch) {
        if (initPromise) {
            return initPromise;
        }

        this._onPresence = this._onPresence.bind(this);

        initPromise = new Promise(resolve => {
            JitsiMeetJS.init({})
            .then(() => {
                JitsiMeetJS.setLogLevel('error');
                this.xmppConnection
                    = new JitsiMeetJS.JitsiConnection(
                        null, null, config.get('xmppConfig'));

                this.xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                    () => {
                        dispatch(setLocalRemoteControlID(this.getJid()));

                        resolve();
                    });

                this.xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_FAILED,
                    logger.error);

                this.xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
                    logger.error);

                this.xmppConnection.xmpp.connection.addHandler(
                    onCommand,
                    null,
                    'message',
                    null,
                    null
                );

                this.xmppConnection.connect();
            });
        });

        return initPromise;
    },

    createMuc(roomName) {
        if (this.room) {
            return this.room;
        }

        this.room = this.xmppConnection.xmpp.createRoom(roomName, {});
        this.room.addPresenceListener('view', this._onPresence);
        this.room.addPresenceListener('audioMuted', this._onPresence);
        this.room.addPresenceListener('videoMuted', this._onPresence);
    },

    joinMuc() {
        if (this.attemptedJoin) {
            return;
        }
        this.room.sendPresence(true);
        this.attemptedJoin = true;
    },

    addCommandListener(callback) {
        commandListeners.push(callback);
    },

    getJid() {
        return this.xmppConnection.xmpp.connection.jid;
    },

    getNode() {
        const jid = this.getJid();

        return jid.split('@')[0];
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

        this.xmppConnection.xmpp.connection.send(message);
    },

    _onPresence(data, from, jid) {
        presenceListeners.forEach(cb => cb(data, from, jid));
    },

    sendPresence(type, value) {
        if (!this.room) {
            return;
        }

        this.room.addToPresence(type, { value });
        this.room.sendPresence();
    },

    addPresenceListener(callback) {
        presenceListeners.push(callback);
    },

    removePresenceListener(callback) {
        presenceListeners = presenceListeners.filter(cb => cb !== callback);
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
