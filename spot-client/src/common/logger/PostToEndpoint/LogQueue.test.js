import LogQueue from './LogQueue';

describe('LogQueue', () => {
    let logQueue;

    beforeEach(() => {
        logQueue = new LogQueue();
    });

    describe('hasQueuedLog', () => {
        it('returns true if any logs are queued', () => {
            logQueue.addLogs([ {} ]);

            expect(logQueue.hasQueuedLogs()).toBe(true);
        });

        it('returns false if no logs are queued', () => {
            expect(logQueue.hasQueuedLogs()).toBe(false);
        });
    });

    describe('pullAllLogs', () => {
        it('returns all queued logs as one bunch', () => {
            logQueue.addLogs([ { 1: 1 }, { 2: 2 } ]);
            logQueue.addLogs([ { 3: 3 } ]);

            expect(logQueue.pullAllLogs()).toEqual([
                { 1: 1 },
                { 2: 2 },
                { 3: 3 }
            ]);

            expect(logQueue.hasQueuedLogs()).toBe(false);
        });
    });
});
