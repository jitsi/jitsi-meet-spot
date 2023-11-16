import Bowser from 'bowser';
import { JitsiMeetJSProvider } from 'common/vendor';

// TODO: Bowser is deprecated, replace it. -saghul
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
    return navigator.userAgent.includes('Electron');
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
        && (jitsiBrowserDetection.isChromiumBased() || jitsiBrowserDetection.isElectron());
}

/**
 * Returns whether or not the current environment supports wirelessly screen-sharing into a Spot.
 * Currently only Chrome works and the underlying implementation assumes getDisplayMedia is
 * available.
 *
 * @private
 * @returns {boolean}
 */
export function isWirelessScreenshareSupported() {
    const jitsiBrowserDetection = JitsiMeetJSProvider.get().util.browser;

    // TODO: Firefox and Safari do support gDM, but the proxy connection fails.
    return isDesktopBrowser()
        && jitsiBrowserDetection.isChromiumBased()
        && jitsiBrowserDetection.supportsGetDisplayMedia()
        && !jitsiBrowserDetection.isElectron();
}
