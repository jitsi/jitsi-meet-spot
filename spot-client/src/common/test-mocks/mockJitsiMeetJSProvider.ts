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
     * @param callback - The function to invoke when a specific event
     * is to be emitted.
     * @param namespace - The XMPP message namespace to listen to.
     * @param event - The message type to respond to.
     * @returns A function to delete the handler.
     */
    addHandler(callback: (...args: any[]) => void, _namespace: string, event: string): () => void {
        return this.addListener(event, callback);
    }

    /**
     * Stop listening for events with the current handler.
     *
     * @param handler - The delete handler function returned from
     * the addHandler method.
     * @returns {void}
     */
    deleteHandler(handler: () => void): void {
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
     * @param event - The event name to listen to.
     * @param callback - The function to invoke when the event is
     * emitted.
     * @returns A function to delete the handler.
     */
    addEventListener(event: string, callback: (...args: any[]) => void): () => void {
        return this.addListener(event, callback);
    }

    /**
     * Join a specified MUC.
     *
     * @returns {Promise}
     */
    join(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Emits events as if the MUC has been joined.
     *
     * @returns {void}
     */
    _simulateJoinEvent(): void {
        this.emit('xmpp.muc_joined');
    }
}

/**
 * Mock implementation of JitsiMeetJS XMPP connection.
 */
class XmppConnection extends Emitter {
    connection: Connection;

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
    createRoom(): Room {
        return new Room();
    }
}

/**
 * Mock implementation of JitsiMeetJS JitsiConnection which encapsulate a
 * connection with XMPP/Prosody and a MUC.
 */
class JitsiConnection extends Emitter {
    _appId: string;
    _jwt: string;
    _options: any;
    xmpp: XmppConnection;

    /**
     * Initializes a new instance.
     *
     * @param appId - An identifying string for what app is creating
     * the connection.
     * @param jwt - A token for identifying the local user.
     * @param options - Additional configuration.
     */
    constructor(appId: string, jwt: string, options: any) {
        super();

        this._appId = appId;
        this._jwt = jwt;
        this._options = options;

        this.xmpp = new XmppConnection();
    }

    /**
     * Begin listening for events from the XMPP connection.
     *
     * @param event - The event name to listen to.
     * @param callback - The function to invoke when the event is
     * emitted.
     * @returns A function to delete the handler.
     */
    addEventListener(event: string, callback: (...args: any[]) => void): () => void {
        return this.addListener(event, callback);
    }

    /**
     * Mock for connecting to the XMPP server.
     *
     * @returns {Promise}
     */
    connect(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Mock for stopping the connection to XMPP server.
     *
     * @returns {Promise}
     */
    disconnect(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Stop listening for events with the givent handler.
     *
     * @param event - The event name to listen to.
     * @param callback - The function to stop invoking.
     * @returns {void}
     */
    removeEventListener(event: string, callback: (...args: any[]) => void): void {
        this.removeListener(event, callback);
    }

    /**
     * Emits events that would occur when the XMPP connection succeeded.
     *
     * @returns {void}
     */
    _simulateConnectionEstablished(): void {
        this.emit(events.connection.CONNECTION_ESTABLISHED);
    }

    /**
     * Emits events that would occur when the XMPP connection could not be
     * created or has been disconnected unexpectedly.
     *
     * @param error - The error to pass along as the reason for the
     * failure.
     * @returns {void}
     */
    _simulateConnectionFailed(error: string): void {
        this.emit(events.connection.CONNECTION_FAILED, error);
    }

    /**
     * Emits a presence update.
     *
     * @returns {void}
     */
    _simulatePresenceUpdate(): void {
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
