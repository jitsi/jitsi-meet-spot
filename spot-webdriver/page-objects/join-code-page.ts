import type { BrowserName } from '../constants/index.js';
import * as constants from '../constants/index.js';

import PageObject from './page-object.js';

const JOIN_CODE_INPUT = '.join-code-input';
const JOIN_CODE_SUBMIT_BUTTON = '.join-code-submit';
const JOIN_CODE_VIEW = '.join-code-view';

/**
 * A page object for interacting with the join code entry view of Spot-Remote.
 */
class JoinCodePage extends PageObject {
    /**
     * Initializes a new {@code JoinCodePage} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, JOIN_CODE_VIEW);
    }

    /**
     * Enters a join code.
     *
     * @param code - The code to be entered.
     * @returns {void}
     */
    async enterCode(code: string): Promise<void> {
        await this.waitForElementDisplayed(JOIN_CODE_INPUT);

        for (const character of code) {
            await this._browser.keys(character);
        }

    }

    /**
     * Manually submits any entered join code.
     *
     * @returns {void}
     */
    async submitCode(): Promise<void> {
        await this.waitForElementDisplayed(JOIN_CODE_SUBMIT_BUTTON);

        const submitButton = await this.select(JOIN_CODE_SUBMIT_BUTTON);

        await submitButton.click();
    }

    /**
     * Proceeds directly to the join code view of Spot-Remote.
     *
     * @param queryParams - Additional parameters to append to the join
     * code url.
     * @param visibilityWait - Override for how long page load should wait for before reporting the page as
     * having failed to load. Pass '-1' to skip the waiting.
     * @returns {void}
     */
    async visit(queryParams?: Map<string, unknown>, visibilityWait?: number): Promise<void> {
        const joinCodePageUrl = this._getJoinCodePageUrl(queryParams);

        await this._browser.url(joinCodePageUrl);

        if (visibilityWait !== -1) {
            await this.waitForVisible(visibilityWait);
        }
    }

    /**
     * Generates the URL to visit the join code page.
     *
     * @param queryParams - Additional parameters to append to the join
     * code url.
     * @private
     * @returns {string}
     */
    _getJoinCodePageUrl(queryParams?: Map<string, unknown>): string {
        let joinCodePageUrl = constants.JOIN_CODE_ENTRY_URL;

        if (queryParams) {
            joinCodePageUrl += '?';

            for (const [ key, value ] of queryParams) {
                joinCodePageUrl += `${key}=${value}&`;
            }
        }

        return joinCodePageUrl;
    }
}

export default JoinCodePage;
