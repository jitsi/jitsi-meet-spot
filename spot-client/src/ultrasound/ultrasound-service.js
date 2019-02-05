/**
 * Hides the implementation details of transmitting ultrasound messages.
 */
class UltrasoundService {
    /**
     * Sets the message to be transmitted. Transmission happens automatically
     * as long as a message is set.
     *
     * @param {string} message - Things yo.
     * @returns {void}
     */
    setMessage(message = '') {
        if (!window.parent || !window.parent.postMessage) {
            return;
        }

        // FIXME: think about the security implications here with sending the
        // message out to the parent. This might be okay for demo purposes but
        // not any further.
        window.parent.postMessage(
            JSON.stringify({
                type: 'ultrasound-message-set',
                message
            }),
            '*'
        );
    }
}

export default new UltrasoundService();
