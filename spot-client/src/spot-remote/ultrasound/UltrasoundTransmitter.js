import {
    Transmitter,
    loadDependencies,
    profiles,
    str2ab
} from 'lib-quiet-js';

/**
 * Encapsulates the implementation details loading ultrasound and transmitting
 * ultrasound messages.
 */
export default class UltrasoundTransmitter {
    /**
     * Calls to load any other files lib-quiet-js may need.
     *
     * @param {string} emscriptenPath - The url path, excluding the filename,
     * for the emscripten used by lib-quiet-js.
     * @param {string} memoryInitializerPath - The url path, excluding the
     * filename, for the memory file dynamically loaded by the emscripten.
     * @returns {void}
     */
    static loadDependencies(emscriptenPath, memoryInitializerPath) {
        return loadDependencies({
            emscriptenPath,
            memoryInitializerPath
        });
    }

    /**
     * Initializes a new {@code ultrasoundTransmitter} instance.
     *
     * @param {number} transmissionDelayMS - The gap between emitting ultrasonic
     * messages, in milliseconds.
     * @param {string} initialText - Any text to start transmitting immediately
     * after instantiation.
     */
    constructor(transmissionDelayMS = 3000, initialText) {
        /**
         * The instance plays ultrasound to transmit text and then enqueues
         * another transmission to be transmitted after a timeout. A timeout is
         * used to have a consistent interval between message plays.
         *
         * @type {timeoutID}
         */
        this._nextTransmissionTimeout = null;

        /**
         * The amount of time in milliseconds to wait between transmitting an
         * ultrasound message.
         *
         * @type {number}
         */
        this._transmissionDelayMS = transmissionDelayMS;

        /**
         * The instance of {@code Transmitter} used to emit ultrasound.
         */
        this._transmitter = new Transmitter({
            onFinish: this._onEnqueueNextTransmission.bind(this),
            profile: profiles['ultrasonic-experimental']
        });

        /**
         * The text to be transmitted using ultrasonic frequencies.
         *
         * @type {ArrayBuffer|null}
         */
        this._text = null;

        if (initialText) {
            this.broadcast(initialText);
        }
    }

    /**
     * Stops ultrasound from being emitted anymore.
     *
     * @returns {void}
     */
    destroy() {
        this._transmitter.destroy();
        this.stopBroadcasting();
        this._text = null;
    }

    /**
     * Updates the text to be transmitted and initializes a {@code Transmitter}
     * to send the text if not already initialized.
     *
     * @param {string} text - The message to be transmitted via ultrasound.
     * @returns {void}
     */
    broadcast(text) {
        this._text = str2ab(text.trim());

        // Transmit immediately if not already transmitting.
        if (!this._nextTransmissionTimeout) {
            this._transmit();
        }
    }

    /**
     * Stops ultrasound from being emitting the current message.
     *
     * @returns {void}
     */
    stopBroadcasting() {
        clearTimeout(this._nextTransmissionTimeout);
        this._nextTransmissionTimeout = null;
    }

    /**
     * Sets a timeout to transmit the next message.
     *
     * @returns {void}
     */
    _onEnqueueNextTransmission() {
        clearTimeout(this._nextTransmissionTimeout);

        this._nextTransmissionTimeout
            = setTimeout(() => this._transmit(), this._transmissionDelayMS);
    }

    /**
     * Calls the {@code Transmitter} instance to play a message using an
     * ultrasonic frequency.
     *
     * @private
     * @returns {void}
     */
    _transmit() {
        if (this._text) {
            this._transmitter.transmit(this._text);
        }
    }
}
