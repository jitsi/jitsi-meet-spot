import { type IpcMainEvent, type WebContents, ipcMain } from 'electron';
import { EventEmitter } from 'node:events';

import { logger } from '../logger/index.js';
import { CAN_SEND_MSG_EVENT } from './events.js';

/** Shape of a `native-command` message sent by the spot-client renderer. */
interface NativeCommandMessage {
    args?: unknown;
    command: string;
}

/**
 * Implements a class that handles communication between the SpotTV web app running in the window and the
 * native electron app.
 */
class ClientController extends EventEmitter {
    private _spotClientRef?: WebContents;

    /**
     * Instantiates a new instance.
     */
    constructor() {
        super();

        ipcMain.on('native-command', (_event: IpcMainEvent, message: NativeCommandMessage) => {
            this._handleClientMessage(message);
        });
        ipcMain.on('spot-client/ready', (event: IpcMainEvent) => {
            this._spotClientRef = event.sender;

            const clearReference = () => {
                if (this._spotClientRef === event.sender) {
                    this._spotClientRef = undefined;
                    this.emit(CAN_SEND_MSG_EVENT, this.canSendClientMessage());
                }
            };

            this._spotClientRef.once('render-process-gone', clearReference);
            this._spotClientRef.once('destroyed', clearReference);

            this.emit(CAN_SEND_MSG_EVENT, this.canSendClientMessage());
        });
    }

    /**
     * Handles an incoming message (command) from the client and emits as an event.
     *
     * @param message - The actual message.
     * @returns {void}
     */
    _handleClientMessage(message: NativeCommandMessage): void {
        const { args, command } = message;

        logger.info(`Native command received: ${command}`, {
            command,
            args: JSON.stringify(args)
        });
        this.emit(command, args);
    }

    /**
     * Sends a message to spot-client JS counterpart. Check {@link canSendClientMessage}, before sending a message or
     * the operation may result in a no op.
     *
     * @param channelName - The name of the channel on which the message will be sent.
     * @param args - Any arguments to be sent to the spot-client.
     * @returns {void}
     */
    sendClientMessage(channelName: string, ...args: unknown[]): void {
        this._spotClientRef?.send(channelName, ...args);
    }

    /**
     * To be used by API consumer to check if the client controller is ready to send messages back to the spot-client.
     *
     * @returns {boolean}
     */
    canSendClientMessage(): boolean {
        return Boolean(this._spotClientRef);
    }
}

export default new ClientController();
