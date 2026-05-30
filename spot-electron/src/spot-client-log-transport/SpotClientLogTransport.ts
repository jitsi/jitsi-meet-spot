import { levels } from '@jitsi/logger';

import { clientController, events } from '../client-control/index.js';

/**
 * Log levels supported by the jitsi logger.
 */
const levelNames = Object.keys(levels).map(l => l.toLowerCase());

const LOG_CACHE_SIZE = 1000;

/** A log entry buffered until the renderer is ready to receive it. */
interface CachedLog {
    context?: unknown;
    level: string;
    message: string;
}

/**
 * SpotClientLogTransport - used to send electron logs to the renderer process so they can be displayed
 * in the web console.
 */
class SpotClientLogTransport {
    private _logsCache: CachedLog[];

    /**
     * Creates a new instance and registers itself to receive logs.
     */
    constructor() {
        // The jitsi-logger calls transport[level](...) for each level, so expose a method per level.
        for (const level of levelNames) {
            (this as Record<string, unknown>)[level] = this._logImpl.bind(this, level);
        }

        this._logsCache = [];

        clientController.on(events.CAN_SEND_MSG_EVENT, (canSendMsgs: boolean) => {
            if (canSendMsgs) {
                for (const delayedLog of this._logsCache) {
                    const {
                        level,
                        message,
                        context
                    } = delayedLog;

                    clientController.sendClientMessage('spot-electron-logs', level, message, context);
                }
                this._logsCache = [];
            }
        });
    }

    /**
     * The log message executed for every logging level.
     *
     * @param level - The logging level as defined by the jitsi-logger lib.
     * @param loggerName - The logger name automatically added as argument by the jitsi-logger.
     * @param message - A message passed to the corresponding log level method.
     * @param context - Optional additional information as a JSON compatible object.
     * @returns {void}
     */
    private _logImpl(level: string, loggerName: string, message: string, context?: unknown): void {
        const msgString = `${loggerName} ${message}`;

        // Send logs to the renderer process once it has finished loading.
        if (clientController.canSendClientMessage()) {
            clientController.sendClientMessage('spot-electron-logs', level, msgString, context);
        } else {
            if (this._logsCache.length >= LOG_CACHE_SIZE) {
                this._logsCache.shift();
            }

            this._logsCache.push({
                level,
                message: msgString,
                context
            });
        }
    }
}

export default new SpotClientLogTransport();
