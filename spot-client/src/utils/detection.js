/**
 * A helper for detecting if autofocus works in the current environment. In some
 * environments, namely mobile browsers, autofocus is not respected and instead
 * a user action is required to focus.
 *
 * @returns {boolean}
 */
export function isAutoFocusSupported() {
    const userAgent = window.navigator.userAgent.toLowerCase();

    return !/iphone|ipad/.test(userAgent);
}
