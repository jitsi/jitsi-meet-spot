import {
    Transmitter,
    loadDependencies,
    profiles,
    str2ab
} from 'lib-quiet-js';

import { logger } from 'common/logger';

/**
 * Encapsulates the implementation details loading ultrasound and transmitting
 * ultrasound messages.
 */
class UltrasoundService {
    /**
     * Initializes a new {@code UltrasoundService} instance.
     */
    constructor() {
        this._initializationPromise = null;

        /**
         * Whether or not the ultrasound library has loaded its dependencies and
         * is ready to use.
         *
         * @type {boolean}
         */
        this._isInitialized = false;

        /**
         * The service plays ultrasound to transmit text and then enqueues
         * another transmission to be transmitted after a timeout. A timeout is
         * used to have a consistent interval between message plays.
         *
         * @type {timeoutID}
         */
        this._nextTransmissionTimeout = null;

        /**
         * The text to be transmitted using ultrasonic frequencies.
         *
         * @type {ArrayBuffer|null}
         */
        this._text = null;

        /**
         * The amount of time in milliseconds to wait between transmitting an
         * ultrasound message.
         *
         * @type {number}
         */
        this._transmissionDelay = 3000;

        /**
         * The instance of {@code Transmitter} used to emit ultrasound.
         */
        this._transmitter = null;

        this._enqueueNextTransmission
            = this._enqueueNextTransmission.bind(this);

        this._transmit = this._transmit.bind(this);
    }

    /**
     * Loads the external file dependencies for the ultrasound library. The
     * files are loaded dynamically as they are large.
     *
     * @param {string} emscriptenPath - The url path, excluding the filename,
     * for the emscripten used by lib-quiet-js.
     * @param {string} memoryInitializerPath - The url path, excluding the
     * filename, for the memory file dynamically loaded by the emscripten.
     * @param {number} transmissionDelay - The amount of time in milliseconds to
     * wait between transmitting an ultrasound message.
     * @returns {Promise} Resolves when the ultrasound library is ready to use.
     */
    initialize(
            emscriptenPath,
            memoryInitializerPath,
            transmissionDelay = 3000
    ) {
        if (this._initializationPromise) {
            return this._initializationPromise;
        }

        this._initializationPromise = loadDependencies({
            emscriptenPath,
            memoryInitializerPath
        })
        .then(() => {
            logger.log('ultrasound initialized successfully');

            this._isInitialized = true;
            this._transmissionDelay = transmissionDelay;

            if (this._text) {
                this.setMessage(this._text);
            }
        })
        .catch(error => {
            logger.error('ultrasound failed to initialize', { error });

            this._initializationPromise = null;

            return Promise.reject(error);
        });

        return this._initializationPromise;
    }

    /**
     * Updates the text to be transmitted and initializes a {@code Transmitter}
     * to send the text if not already initialized.
     *
     * @param {string} text - The message to be transmitted via ultrasound.
     * @returns {void}
     */
    setMessage(text = '') {
        const trimmed = text && text.trim();

        this._text = trimmed ? str2ab(trimmed) : null;

        if (!this._isInitialized) {
            return;
        }

        if (!this._transmitter && this._text) {
            this._transmitter = new Transmitter({
                onFinish: this._enqueueNextTransmission,
                profile: profiles['ultrasonic-experimental']
            });

            logger.log('ultrasound starting transmit process');

            this._transmit();
        }
    }

    /**
     * Sets a timeout to transmit the next message.
     *
     * @returns {void}
     */
    _enqueueNextTransmission() {
        clearTimeout(this._nextTransmissionTimeout);

        this._nextTransmissionTimeout
            = setTimeout(this._transmit, this._transmissionDelay);
    }

    /**
     * Calls the {@code Transmitter} instance to play a message using an
     * ultrasonic frequency.
     *
     * @private
     * @returns {void}
     */
    _transmit() {
        if (this._transmitter && this._text) {
            this._transmitter.transmit(this._text);
        } else {
            this._enqueueNextTransmission();
        }
    }
}

export default new UltrasoundService();
