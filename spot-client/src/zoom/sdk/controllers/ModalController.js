/**
 * Encapsulates interacting with the Zoom main modal.
 */
export default class ModalController {
    static modalContentSelector = '.zm-modal .zm-modal-body-content .content';
    static actionButtonsSelector = '.zm-modal-footer-default button'

    /**
     * Attempt to click a button on the modal to close it.
     *
     * @param {string} [dismissButtonText] - The string that displays on the
     * button that should be clicked. Defaults to looking for "OK."
     * @returns {void}
     */
    dismiss(dismissButtonText = 'OK') {
        const modalButtons = document.querySelectorAll(ModalController.actionButtonsSelector);

        Array.from(modalButtons).find(modalButton => {
            if (modalButton.textContent === dismissButtonText) {
                modalButton.click();

                return true;
            }

            return false;
        });
    }

    /**
     * Closes the modal informing specifically about needing a password to join
     * the call. If not found, no modal will be dismissed.
     *
     * @returns {void}
     */
    dismissIncorrectPasswordModal() {
        const modalText = document.querySelector(ModalController.modalContentSelector);

        if (modalText && modalText.textContent === 'password wrong') {
            this.dismiss();
        }
    }
}
