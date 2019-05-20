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
 * Returns whether or not the current Spot-TV environment has access to OS level
 * functionality.
 *
 * @returns {boolean}
 */
export function isOSFunctionalitySupported() {
    const jitsiBrowserDetection = JitsiMeetJSProvider.get().util.browser;

    return jitsiBrowserDetection.isElectron();
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
