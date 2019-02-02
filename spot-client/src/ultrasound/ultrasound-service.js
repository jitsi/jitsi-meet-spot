/**
 * Whatever the ever.
 */
class UltrasoundService {
    /**
     * Whatever the ever.
     *
     * @param {string} message - Things yo.
     * @returns {void}
     */
    setMessage(message = '') {
        if (!window.parent || !window.parent.postMessage) {
            return;
        }

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
