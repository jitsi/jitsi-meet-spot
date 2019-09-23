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
    return _hasReactNativeOnlyAttributes()
        || _isIOSWebView()
        || _isAndroidWebView();
}

/**
 * Encapsulates checking the current environment for features that should only
 * exist in the Spot-Controller (React-Native) app.
 *
 * @returns {boolean}
 */
function _hasReactNativeOnlyAttributes() {
    return Boolean(window.ReactNativeWebView)
        || window.navigator.userAgent.includes('SpotController');
}

/**
 * Encapsulates checks for determining if the environment is the Spot-Controller
 * app but it is using an older version with explicit attributes set on the
 * environment.
 *
 * @returns {boolean}
 */
function _isAndroidWebView() {
    return browser.getBrowserName() === 'Chrome'
        && window.navigator.userAgent.includes('wv');
}

/**
 * Encapsulates checks for determining if the environment is the Spot-Controller
 * app but it is using an older version with explicit attributes set on the
 * environment.
 *
 * @returns {boolean}
 */
function _isIOSWebView() {
    return browser.getBrowserName() === 'Safari'
        && !browser.getBrowserVersion();
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

/**
 * Returns whether or not the current environment has a bug where caret-color
 * is not respected on the initial focus of a text input element.
 *
 * @returns {boolean}
 */
export function hasVisibleCaretOnInitialFocus() {
    return _hasReactNativeOnlyAttributes()
        && _isIOSWebView()
        && _isMaybeIOS13();
}

/**
 * Detects whether or not the current environment is in iOS 13. Starting with
 * iOS 13, the user agent may return that it is actually macOS, and bowser does
 * not have a workaround for this yet. As such, there is an assumption that
 * a mobile platform with a certain macOS version may  be 13.
 *
 * @private
 * @returns {boolean}
 */
function _isMaybeIOS13() {
    return (browser.getOSName() === 'iOS' && browser.getOSVersion().startsWith('13'))
        || (browser.getPlatformType() === 'mobile' && browser.getOSVersion().startsWith('10.15'));
}
