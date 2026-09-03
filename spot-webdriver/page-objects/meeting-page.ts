import type { BrowserName } from '../constants/index.js';
import * as constants from '../constants/index.js';

import PageObject from './page-object.js';

const AUDIO_MUTED_INDICATOR = '.audio-muted-status';
const MEETING_IFRAME = '#jitsiConferenceFrame0';
const MEETING_VIEW = '.meeting-view';
const VIDEO_MUTED_INDICATOR = '.video-muted-status';

/**
 * A page object for interacting with the in-meeting view of Spot-TV.
 */
class MeetingPage extends PageObject {
    /**
     * Initializes a new {@code MeetingPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, MEETING_VIEW);
    }

    /**
     * Checks the Jitsi-Meet iFrame for the meeting name it is displaying.
     *
     * @returns {string}
     */
    async getMeetingName(): Promise<string | undefined> {
        const iframe = await this.select(MEETING_IFRAME);

        const meetingUrl = await iframe.getAttribute('src');

        const urlParts = new URL(meetingUrl ?? '');

        return urlParts.pathname.split('/').pop();
    }

    /**
     * Checks whether or not the Jitsi-Meet iFrame is visible.
     *
     * @returns {boolean}
     */
    async isDisplayingMeeting(): Promise<boolean> {
        const meetingIframeEl = await this.select(MEETING_IFRAME);

        return await meetingIframeEl.isDisplayed();
    }

    /**
     * Checks the Jitsi-Meet iFrame for whether or not tile view layout is
     * currently displayed.
     *
     * @returns {boolean}
     */
    async isInTileView(): Promise<boolean> {
        const { tileView } = await this._getSpotTvState();

        return Boolean(tileView);
    }

    /**
     * Waits for the audio muted status indicator to be displayed or hidden.
     *
     * @param muted - The state in which the audio muted status
     * indicator needs to be in.
     * @returns {void}
     */
    async waitForAudioMutedStateToBe(muted: boolean): Promise<void> {
        if (muted) {
            await this.waitForElementDisplayed(AUDIO_MUTED_INDICATOR);
        } else {
            await this.waitForElementHidden(AUDIO_MUTED_INDICATOR);
        }
    }

    /**
     * Waits for the Jitsi-Meet meeting to be displayed.
     *
     * @returns {void}
     */
    async waitForMeetingJoined(): Promise<void> {
        await this.waitForElementDisplayed(MEETING_IFRAME, constants.MEETING_LOAD_WAIT);

        const loadingCurtainEl = await this.select('.loading-curtain');

        await loadingCurtainEl.waitForExist({ timeout: constants.MEETING_LOAD_WAIT,
            reverse: true });
    }

    /**
     * Waits for the Jitsi-Meet meeting to either show or not show the
     * raised hands indicator.
     *
     * @param raised - Whether it is expected that the raised hands
     * indicator be displayed or not.
     * @returns {void}
     */
    async waitForHandRaisedStateToBe(raised: boolean): Promise<void> {
        await this._browser.waitUntil(
            async () => Boolean((await this._getSpotTvState()).handRaised) === raised,
            {
                timeout: constants.REMOTE_COMMAND_WAIT,
                timeoutMsg: `Spot-TV hand raised state did not become ${raised}`
            }
        );
    }

    /**
     * Waits for the Jitsi-Meet meeting to either show or not show tile view
     * layout.
     *
     * @param enabled - Whether it is expected that tile view be
     * displayed or not.
     * @returns {void}
     */
    async waitForTileViewStateToBe(enabled: boolean): Promise<void> {
        await this._browser.waitUntil(
            async () => Boolean((await this._getSpotTvState()).tileView) === enabled,
            {
                timeout: constants.REMOTE_COMMAND_WAIT,
                timeoutMsg: `Spot-TV tile view state did not become ${enabled}`
            }
        );
    }

    /**
     * Waits for the video muted status indicator to be displayed or hidden.
     *
     * @param muted - The state in which the video muted status
     * indicator needs to be in.
     * @returns {void}
     */
    async waitForVideoMutedStateToBe(muted: boolean): Promise<void> {
        if (muted) {
            await this.waitForElementDisplayed(VIDEO_MUTED_INDICATOR);
        } else {
            await this.waitForElementHidden(VIDEO_MUTED_INDICATOR);
        }
    }

    /**
     * Reads the Spot-TV's view of the current meeting state from its Redux
     * store. The Spot-TV mirrors the Jitsi-Meet conference state (hand raise,
     * tile view, ...) into this store from the Jitsi-Meet external API events,
     * so the harness can poll it directly instead of reaching into the
     * cross-origin Jitsi-Meet iframe (which is brittle under frame switching).
     *
     * @private
     * @returns {Promise<{ handRaised?: boolean; tileView?: boolean; }>}
     */
    async _getSpotTvState(): Promise<{ handRaised?: boolean; tileView?: boolean; }> {
        return await this._browser.execute(() => {
            try {
                return window.spot.store.getState().spotTv;
            } catch {
                return {};
            }
        });
    }
}

export default MeetingPage;
