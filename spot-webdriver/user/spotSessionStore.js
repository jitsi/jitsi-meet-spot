const SpotSession = require('./spot-session');
const userFactory = require('./user-factory');

/**
 * Creates and holds a collection of {@code SpotSession} instances.
 */
class SpotSessionStore {
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
    createSession() {
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
    clearSessions() {
        this._sessions.forEach(session => {
            session.resetConnection();
        });

        this._sessions.clear();
    }
}

module.exports = new SpotSessionStore();
