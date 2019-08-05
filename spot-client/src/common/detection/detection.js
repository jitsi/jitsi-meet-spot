import Bowser from 'bowser';

import { JitsiMeetJSProvider } from 'common/vendor';

const browser = Bowser.getParser(window.navigator.userAgent);

/**
 * A helper for detecting if autofocus works in the current environment. In some
 * environments, namely mobile browsers, autofocus is not respected and instead
 * a user action is required to focus.
 *
 * @returns {boolean}
 */
export function isAutoFocusSupported() {
    /**
     * Even if autofocus is supported on a mobile browser it may not automatically
     * display the software keyboard.
     */
    return isDesktopBrowser();
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

/**
 * Returns true if the app os running in an electron wrapper, false otherwise.
 *
 * @returns {boolean}
 */
export function isElectron() {
    return Boolean(window && window.process && window.process.emit);
}

/**
 * Returns true it the app is running the Spot-Controller native app.
 *
 * @returns {boolean}
 */
export function isSpotControllerApp() {
    return Boolean(window.ReactNativeWebView);
}

/**
 * Returns whether or not the current environment can support Spot-TV features.
 *
 * @returns {boolean}
 */
export function isSupportedSpotTvBrowser() {
    const jitsiBrowserDetection = JitsiMeetJSProvider.get().util.browser;

    return isDesktopBrowser()
        && (jitsiBrowserDetection.isChrome() || jitsiBrowserDetection.isElectron());
}

/**
 * Returns whether or not the current environment supports wirelessly screensharing into a Spot.
 * Currently only Chrome works and the underlying implementation assumes getDisplayMedia is
 * available.
 *
 * @private
 * @returns {boolean}
 */
export function isWirelessScreenshareSupported() {
    const jitsiBrowserDetection = JitsiMeetJSProvider.get().util.browser;

    // Chrome on Android is detected by LJM to support getDisplayMedia, but then it always fails when called
    return (isDesktopBrowser() && jitsiBrowserDetection.isChrome() && jitsiBrowserDetection.supportsGetDisplayMedia())
        || jitsiBrowserDetection.isElectron();
}
