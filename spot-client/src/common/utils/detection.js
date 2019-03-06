import Bowser from 'bowser';

const browser = Bowser.getParser(window.navigator.userAgent);

/**
 * A helper for detecting if autofocus works in the current environment. In some
 * environments, namely mobile browsers, autofocus is not respected and instead
 * a user action is required to focus.
 *
 * @returns {boolean}
 */
export function isAutoFocusSupported() {
    const { model } = browser.getPlatform();

    return model === 'iPhone' || model === 'iPad';
}

/**
 * Returns whether or not the current environment is a desktop, versus mobile
 * or tablet.
 *
 * @returns {boolean}
 */
export function isDesktopBrowser() {
    return browser.getPlatformType() === 'desktop';
}
