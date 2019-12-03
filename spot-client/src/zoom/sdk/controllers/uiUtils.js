/**
 * Interacts with the DOM to click the element which matches the provided
 * selector.
 *
 * @param {string} selector - The css query selector to use to find the
 * element.
 * @returns {boolean} True if the element was clicked, false otherwise.
 */
export function clickIfExists(selector) {
    const element = document.querySelector(selector);

    if (element) {
        element.click();

        return true;
    }

    return false;
}

/**
 * Clicks on an expected element once it exists in the DOM.
 *
 * @param {string} selector - The css query selector to use to find the
 * element.
 * @param {numer} [timeout] - The amount of time to wait, in milliseconds, for
 * the element to come into existence.
 * @returns {Promise} Resolves if the element is clicked, rejects otherwise.
 */
export function waitForExistAndClick(selector, timeout = 30000) {
    const intervalMax = Date.now() + timeout;

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const targetElement = document.querySelector(selector);

            if (targetElement) {
                clearInterval(interval);
                targetElement.click();
                resolve();
            } else if (Date.now() > intervalMax) {
                clearInterval(interval);
                reject();
            }
        }, 100);
    });
}
