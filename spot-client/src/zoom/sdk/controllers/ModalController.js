/**
 * Encapsulates interacting with the Zoom main modal.
 */
export default class ModalController {
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
}
