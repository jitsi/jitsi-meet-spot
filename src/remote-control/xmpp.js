/* global JitsiMeetJS */

import { XMPP_CONFIG } from 'config';
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
     * @param {string} roomName - The name of the MUC to join. A MUC will be
     * created if a name is not provided.
     * @param {string} lock - The lock code needed to join an existing MUC.
     * @returns {Promise<string>} - The promise resolves with the connection's
     * jid.
     */
    init(roomName, lock) {
        if (initPromise) {
            return initPromise;
        }

        this._onMessage = this._onMessage.bind(this);
        this._onPresence = this._onPresence.bind(this);

        JitsiMeetJS.init({});
        JitsiMeetJS.setLogLevel('error');

        this.xmppConnection
            = new JitsiMeetJS.JitsiConnection(null, null, XMPP_CONFIG);

        initPromise = new Promise(resolve => {
            this.xmppConnection.addEventListener(
                JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                () => resolve());
        });

        this.xmppConnection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_FAILED,
            logger.error);

        this.xmppConnection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
            logger.error);

        this.xmppConnection.xmpp.connection.addHandler(
            this._onMessage,
            null,
            'message',
            null,
            null
        );

        this.xmppConnection.xmpp.connection.addHandler(
            this._onPresence,
            null,
            'presence',
            null,
            null
        );

        this.xmppConnection.connect();

        // FIXME: the existence of room name is being used to add spot identity
        // to presence for now.

        return initPromise
            .then(() => this._createMuc(roomName || `${Date.now()}-spot`))
            .then(() => this.updatePresence('isSpot', !roomName))
            .then(() => this._joinMuc(lock));
    },

    /**
     * Add an observers which should be notified when a command is received
     * through the muc.
     *
     * @param {Function} callback - The listener to invoke when a command is
     * received from a remote.
     * @returns {void}
     */
    addCommandListener(callback) {
        commandListeners.push(callback);
    },

    /**
     * Get the id of the XMPP connection so other participants can send direct
     * messages or identify who sent the messages.
     *
     * @returns {string}
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
     * The identifier for the the muc. Returns the full jid, which has
     * user@domain.
     *
     * @returns {string}
     */
    getRoomBareJid() {
        return this.room.roomjid.split('/')[0];
    },

    /**
     * The identifier for the local user in the MUC. Returns the full jid, which
     * has user@domain/resource.
     *
     * @returns {string}
     */
    getRoomFullJid() {
        return this.room.myroomjid;
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
     * @param {string} resource - The target of the command.
     * @param {string} type - The command type to send.
     * @param {Object} data - Additional information about how to execute the
     * command.
     * @returns {void}
     */
    sendCommand(resource, type, data) {
        const message = {
            type,
            data
        };

        this.room.sendPrivateMessage(resource, JSON.stringify(message), 'body');
    },

    /**
     * Updates the current muc participant's status, which should notify other
     * participants of the update. This is a fire and forget call with no ack.
     *
     * @param {string} type - The status type to send.
     * @param {*} value - Additional information about the status update.
     * @returns {void}
     */
    updateStatus(type, value) {
        let valueToSend = value;

        if (typeof value !== 'string') {
            valueToSend = JSON.stringify(value);
        }

        this.updatePresence(type, valueToSend);
        this.room.sendPresence();
    },

    /**
     * Subscribes an observers for status updates from other participants in the
     * muc.
     *
     * @param {Function} callback - The listener which should be called when
     * another participant has updated its presence.
     * @returns {void}
     */
    addStatusListener(callback) {
        presenceListeners.push(callback);
    },

    /**
     * Unsubscribes an observer from status updates from other participants in
     * the muc.
     *
     * @param {Function} callback - The listener to be removed.
     * @returns {void}
     */
    removePresenceListener(callback) {
        presenceListeners = presenceListeners.filter(cb => cb !== callback);
    },

    /**
     * Sets a new lock code on the current MUC.
     *
     * @param {string} lock - The new code code to place on the MUC.
     * @returns {Promise}
     */
    setLock(lock) {
        this._lock = lock;

        return new Promise(resolve => {
            this.room.lockRoom(this._lock, resolve);
        });
    },

    /**
     * Sets the presence status for a given type.
     *
     * @param {string} type - The present attribute to change.
     * @param {string} value - The new value to associate with the presence
     * attribute.
     * @returns {void}
     */
    updatePresence(type, value) {
        this.room.addToPresence(type, { value });
    },

    /**
     * Creates a MUC for the Spot and remote controllers to join to communicate
     * with each other.
     *
     * @param {string} roomName - The name of the muc to create.
     * @returns {Object} The instance of the created muc.
     */
    _createMuc(roomName) {
        if (this.room) {
            return this.room;
        }

        this.room = this.xmppConnection.xmpp.createRoom(roomName, {});

        return this.room;
    },

    /**
     * Signals to the muc that the participant is joining the muc. This allows
     * for receipt of messages from other participants in the muc.
     *
     * @param {string} lock - A lock code, if any, to set in order to join the
     * muc.
     * @returns {void}
     */
    _joinMuc(lock) {
        if (lock) {
            this.room.join(lock);
        }

        // send presence manually to avoid focus joining
        this.room.sendPresence(true);
        this.attemptedJoin = true;
    },

    /**
     * Callback invoked to respond to private messages.
     *
     * @param {XML} message - A potential private message.
     * @private
     * @returns {boolean}
     */
    _onMessage(message) {
        const from = message.getAttribute('from');

        // Exit if not a private message from the current MUC.
        if (from.split('/')[0] !== this.getRoomBareJid()
            || message.getAttribute('type') !== 'chat') {

            return true;
        }

        const body = message.getElementsByTagName('body')[0];
        const { type, data } = JSON.parse(body.textContent) || {};

        if (type) {
            commandListeners.forEach(cb => cb(type, from, data));
        }

        return true;
    },

    /**
     * Callback invoked when the status of another participant in the muc has
     * changed.
     *
     * @param {XML} presence - Details of the current presence.
     * @private
     * @returns {boolean}
     */
    _onPresence(presence) {
        if (!presenceListeners.length) {
            return true;
        }

        const status = Array.from(presence.children).map(child =>
            [ child.tagName, child.textContent ])
            .reduce((acc, current) => {
                acc[current[0]] = current[1];

                return acc;
            }, {});

        const formattedPresence = {
            from: presence.getAttribute('from'),
            status
        };

        presenceListeners.forEach(cb => cb(formattedPresence));

        return true;
    }
};

export default xmppControl;
