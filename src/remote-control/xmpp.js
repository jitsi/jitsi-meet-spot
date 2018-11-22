/* global JitsiMeetJS */

import { XMPP_CONFIG } from 'config';
import { $msg } from 'strophe.js';
import { logger } from 'utils';

let commandListeners = [];
let presenceListeners = [];
let initPromise;

/**
 * The interface for interacting with the XMPP service which powers the
 * communication between a Spot instance and remote control instances. Both the
 * Spot instance and remote controls join the same MUC and can get messages to
 * each other.
 */
const xmppControl = {
    /**
     * Establishes the XMPP connection with a jitsi deployment.
     *
     * @returns {Promise<string>} - The promise resolves with the connection's
     * jid.
     */
    init() {
        if (initPromise) {
            return initPromise;
        }

        this._onPresence = this._onPresence.bind(this);

        initPromise = new Promise(resolve => {
            JitsiMeetJS.init({})
            .then(() => {
                JitsiMeetJS.setLogLevel('error');
                this.xmppConnection
                    = new JitsiMeetJS.JitsiConnection(null, null, XMPP_CONFIG);

                this.xmppConnection.addEventListener(
                    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                    () => resolve(this.getJid()));

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

    /**
     * Creates a MUC for the Spot and remote controllers to join to communicate
     * with each other.
     *
     * @param {string} roomName - The name of the muc to create.
     * @returns {Object} The instance of the created muc.
     */
    createMuc(roomName) {
        if (this.room) {
            return this.room;
        }

        this.room = this.xmppConnection.xmpp.createRoom(roomName, {});
        this.room.addPresenceListener('view', this._onPresence);
        this.room.addPresenceListener('audioMuted', this._onPresence);
        this.room.addPresenceListener('videoMuted', this._onPresence);

        return this.room;
    },

    /**
     * Signals to the muc that the participant is joining the muc. This allows
     * for receipt of messages from other participants in the muc.
     *
     * @returns {void}
     */
    joinMuc() {
        if (this.attemptedJoin) {
            return;
        }
        this.room.sendPresence(true);
        this.attemptedJoin = true;
    },

    /**
     * Add an observers which should be notified when a command is received
     * through the muc.
     *
     * @param {Function} callback
     * @returns {void}
     */
    addCommandListener(callback) {
        commandListeners.push(callback);
    },

    /**
     * Get the id of the XMPP connection so other participants can send direct
     * messages or identify who sent the messages.
     *
     * @return {string}
     */
    getJid() {
        return this.xmppConnection.xmpp.connection.jid;
    },

    /**
     * Returns the unique id of the XMPP participant, ignoring any domain
     * information.
     *
     * @returns {string}
     */
    getNode() {
        const jid = this.getJid();

        return jid.split('@')[0];
    },

    /**
     * Unsubscribes an observer from commands received through XMPP channels.
     *
     * @param {Function} callback - The observer to unsubscribe.
     * @returns {void}
     */
    removeCommandListener(callback) {
        commandListeners = commandListeners.filter(cb => cb !== callback);
    },

    /**
     * Send a direct message to another participant in the muc. This is a fire
     * and forget function with no ack.
     *
     * @param {string} jid - The target of the command.
     * @param {string} command - The command type to send.
     * @param {Object} options - Additional information about how to execute the
     * command.
     * @returns {void}
     */
    sendCommand(jid, command, options = {}) {
        const message = $msg({
            to: jid,
            type: 'spot-command'
        });

        message.c('body', command).up();
        message.c('options', JSON.stringify(options)).up();

        this.xmppConnection.xmpp.connection.send(message);
    },

    /**
     * Callback invoked when the status of another participant in the muc has
     * changed.
     *
     * @param {Object} data - An object containing information about the status
     * update.
     * @param {string} from - The id of the participant sending the presence
     * update.
     * @param {string} jid
     * @returns {void}
     */
    _onPresence(data, from, jid) {
        presenceListeners.forEach(cb => cb(data, from, jid));
    },

    /**
     * Updates the current muc participant's status, which should notify other
     * participants of the update. This is a fire and forget call with no ack.
     *
     * @param {string} type - The status type to send.
     * @param {*} value - Additional information about the status update.
     * @returns {void}
     */
    sendPresence(type, value) {
        if (!this.room) {
            return;
        }

        this.room.addToPresence(type, { value });
        this.room.sendPresence();
    },

    /**
     * Subscribes an observers for status updates from other participants in the
     * muc.
     *
     * @param {Function} callback
     * @returns {void}
     */
    addPresenceListener(callback) {
        presenceListeners.push(callback);
    },

    /**
     * Unsubscribes an observer from status updates from other participants in
     * the muc.
     *
     * @param {Function} callback
     * @returns {void}
     */
    removePresenceListener(callback) {
        presenceListeners = presenceListeners.filter(cb => cb !== callback);
    }
};

/**
 * Callback invoked to detect Spot-related commands and notify observers.
 *
 * @param {*} message
 * @private
 * @returns {boolean} True so the XMPP service knows to continue with processing
 * the command.
 */
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
