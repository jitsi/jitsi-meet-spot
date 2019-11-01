/**
 * Stores a list of logs and pulls the logs in one batch.
 */
export default class LogQueue {
    _queue = [];

    /**
     * Empties the current queue and combines all logs into one log report.
     *
     * @returns {Array<Object>}
     */
    pullAllLogs() {
        const combinedLogs = [].concat.apply(...this._queue);

        this._queue = [];

        return combinedLogs;
    }

    /**
     * Stores a series of logs for future aggregation.
     *
     * @param {Array<Object>} logs - The client logs to store.
     * @returns {void}
     */
    addLogs(logs) {
        this._queue.push(logs);
    }

    /**
     * Returns whether or not there are any logs that are current queued.
     *
     * @returns {boolean}
     */
    hasQueuedLogs() {
        return this._queue.length > 0;
    }
}
