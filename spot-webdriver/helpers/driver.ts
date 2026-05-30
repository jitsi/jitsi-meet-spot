import type { BrowserName } from '../constants/index.js';

/**
 * Resolves the individual WebdriverIO browser instance for a capability name in
 * the multiremote session (`browser.spotBrowser` / `browser.remoteControlBrowser`).
 *
 * @param name - The capability name of the desired browser.
 * @returns {WebdriverIO.Browser}
 */
export function driverFor(name: BrowserName): WebdriverIO.Browser {
    return (browser as unknown as Record<BrowserName, WebdriverIO.Browser>)[name];
}
