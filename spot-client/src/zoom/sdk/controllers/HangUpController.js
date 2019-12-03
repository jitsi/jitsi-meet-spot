import { clickIfExists, waitForExistAndClick } from './uiUtils';

/**
 * Encapsulates interacting with Zoom's meeting leave flow.
 */
export default class HangUpController {
    static CONFIRM_HANG_UP = '[aria-label="End meeting confir dialog"] .zm-modal-footer button';
    static HANG_UP_BUTTON = 'button.footer__leave-btn';

    /**
     * Attempt to leave the meeting via the UI. Leaving via the UI helps prevent
     * ghost participants from sticking around.
     *
     * @returns {void}
     */
    hangUp() {
        if (clickIfExists(HangUpController.HANG_UP_BUTTON)) {
            waitForExistAndClick(HangUpController.CONFIRM_HANG_UP);
        }
    }
}
