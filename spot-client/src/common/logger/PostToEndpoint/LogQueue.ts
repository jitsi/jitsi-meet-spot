/**
 * Stores a list of logs and pulls the logs in one batch.
 */
export default class LogQueue {
    _queue: any[][] = [];

    /**
     * Empties the current queue and combines all logs into one log report.
     *
     * @returns
     */
    pullAllLogs(): any[] {
        const combinedLogs = ([] as any[]).concat(...this._queue);

        this._queue = [];

        return combinedLogs;
    }

    /**
     * Stores a series of logs for future aggregation.
     *
     * @param logs - The client logs to store.
     * @returns
     */
    addLogs(logs: any[]): void {
        this._queue.push(logs);
    }

    /**
     * Returns whether or not there are any logs that are current queued.
     *
     * @returns
     */
    hasQueuedLogs(): boolean {
        return this._queue.length > 0;
    }
}
