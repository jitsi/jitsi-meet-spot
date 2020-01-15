import { Emitter } from 'common/emitter';

const events = {
    connection: {
        CONNECTION_ESTABLISHED: 'CONNECTION_ESTABLISHED',
        CONNECTION_FAILED: 'CONNECTION_FAILED'
    }
};

/**
 * Mock implemented of the JitsiMeetJS internal Strophe connection.
 */
class Connection extends Emitter {
    /**
     * Registers an event listener.
     *
     * @param {Function} callback - The function to invoke when a specific event
     * is to be emitted.
     * @param {string} namespace - The XMPP message namespace to listen to.
     * @param {string} event - The message type to respond to.
     * @returns {Function} A function to delete the handler.
     */
    addHandler(callback, namespace, event) {
        return this.addListener(event, callback);
    }

    /**
     * Stop listening for events with the current handler.
     *
     * @param {Function} handler - The delete handler function returned from
     * the addHandler method.
     * @returns {void}
     */
    deleteHandler(handler) {
        handler();
    }
}

/**
 * Mock implementation of JitsiMeetJS Chat room.
 */
class Room extends Emitter {
    /**
     * Begin listening for events from the MUC.
     *
     * @param {string} event - The event name to listen to.
     * @param {Function} callback - The function to invoke when the event is
     * emitted.
     * @returns {Function} A function to delete the handler.
     */
    addEventListener(event, callback) {
        return this.addListener(event, callback);
    }

    /**
     * Join a specified MUC.
     *
     * @returns {Promise}
     */
    join() {
        return Promise.resolve();
    }

    /**
     * Emits events as if the MUC has been joined.
     *
     * @returns {void}
     */
    _simulateJoinEvent() {
        this.emit('xmpp.muc_joined');
    }
}

/**
 * Mock implementation of JitsiMeetJS XMPP connection.
 */
class XmppConnection extends Emitter {
    /**
     * Initializes a new instance.
     */
    constructor() {
        super();

        this.connection = new Connection();
    }

    /**
     * Instantiates a new instance of a MUC.
     *
     * @returns {Room}
     */
    createRoom() {
        return new Room();
    }
}

/**
 * Mock implementation of JitsiMeetJS JitsiConnection which encapsulate a
 * connection with XMPP/Prosody and a MUC.
 */
class JitsiConnection extends Emitter {
    /**
     * Initializes a new instance.
     *
     * @param {string} appId - An identifying string for what app is creating
     * the connection.
     * @param {string} jwt - A token for identifying the local user.
     * @param {Object} options - Additional configuration.
     */
    constructor(appId, jwt, options) {
        super();

        this._appId = appId;
        this._jwt = jwt;
        this._options = options;

        this.xmpp = new XmppConnection();
    }

    /**
     * Begin listening for events from the XMPP connection.
     *
     * @param {string} event - The event name to listen to.
     * @param {Function} callback - The function to invoke when the event is
     * emitted.
     * @returns {Function} A function to delete the handler.
     */
    addEventListener(event, callback) {
        return this.addListener(event, callback);
    }

    /**
     * Mock for connecting to the XMPP server.
     *
     * @returns {Promise}
     */
    connect() {
        return Promise.resolve();
    }

    /**
     * Mock for stopping the connection to XMPP server.
     *
     * @returns {Promise}
     */
    disconnect() {
        return Promise.resolve();
    }

    /**
     * Stop listening for events with the givent handler.
     *
     * @param {string} event - The event name to listen to.
     * @param {Function} callback - The function to stop invoking.
     * @returns {void}
     */
    removeEventListener(event, callback) {
        this.removeListener(event, callback);
    }

    /**
     * Emits events that would occur when the XMPP connection succeeded.
     *
     * @returns {void}
     */
    _simulateConnectionEstablished() {
        this.emit(events.connection.CONNECTION_ESTABLISHED);
    }

    /**
     * Emits events that would occur when the XMPP connection could not be
     * created or has been disconnected unexpectedly.
     *
     * @param {string} error - The error to pass along as the reason for the
     * failure.
     * @returns {void}
     */
    _simulateConnectionFailed(error) {
        this.emit(events.connection.CONNECTION_FAILED, error);
    }

    /**
     * Emits a presence update.
     *
     * @returns {void}
     */
    _simulatePresenceUpdate() {
        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(
            '<presence from="any"/>',
            'application/xml'
        );
        const presenceNode = xmlDocument.getElementsByTagName('presence')[0];

        this.xmpp.connection.emit('presence', presenceNode);
    }
}

const JitsiMeetJS = {
    JitsiConnection,
    events
};

export const mockJitsiMeetJSProvider = {
    get() {
        return JitsiMeetJS;
    }
};
