import SpotSession from './spot-session.js';
import userFactory from './user-factory.js';

/**
 * Creates and holds a collection of {@code SpotSession} instances.
 */
class SpotSessionStore {
    private _sessions: Set<SpotSession>;

    /**
     * Creates a new instance of {@code SpotSessionStore}.
     */
    constructor() {
        this._sessions = new Set();
    }

    /**
     * Creates a new {@code SpotSession} instance and saves its reference.
     *
     * @returns {SpotSession}
     */
    createSession(): SpotSession {
        const spotTV = userFactory.getSpotTV();
        const spotRemote = userFactory.getSpotRemote();

        const session = new SpotSession(spotTV, spotRemote);

        this._sessions.add(session);

        return session;
    }

    /**
     * Cleans up all {@code SpotSessions}.
     *
     * @returns {void}
     */
    clearSessions(): void {
        this._sessions.forEach(session => {
            session.cleanup();
        });

        this._sessions.clear();
    }
}

export default new SpotSessionStore();
