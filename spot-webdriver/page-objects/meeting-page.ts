import type { BrowserName } from '../constants/index.js';
import * as constants from '../constants/index.js';

import PageObject from './page-object.js';

const AUDIO_MUTED_INDICATOR = '.audio-muted-status';
const RAISED_HANDS_INDICATOR = '#raisedHandsCountLabel';
const MEETING_IFRAME = '#jitsiConferenceFrame0';
const MEETING_VIEW = '.meeting-view';
const VIDEO_MUTED_INDICATOR = '.video-muted-status';

const JITSI_MEET_TILE_VIEW_LAYOUT = '#videoconference_page.tile-view';

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
        let tileViewDisplayed = false;

        await this._executeWithingMeetingFrame(async () => {
            const tileViewLayoutEl = await this.select(JITSI_MEET_TILE_VIEW_LAYOUT);

            tileViewDisplayed = await tileViewLayoutEl.isExisting();
        });

        return tileViewDisplayed;
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
        await this._executeWithingMeetingFrame(async () => {
            if (raised) {
                await this.waitForElementDisplayed(RAISED_HANDS_INDICATOR);
            } else {
                await this.waitForElementHidden(RAISED_HANDS_INDICATOR);
            }
        });
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
        await this._executeWithingMeetingFrame(async () => {
            if (enabled) {
                await this.waitForElementDisplayed(JITSI_MEET_TILE_VIEW_LAYOUT);
            } else {
                const meetTileViewLayout = await this.select(JITSI_MEET_TILE_VIEW_LAYOUT);

                await meetTileViewLayout.waitForExist({ reverse: true });
            }
        });
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
     * Switches driver context to perform actions within the Jitsi-Meet meeting
     * page itself.
     *
     * @param task - The actions to perform while in the context of
     * the Jitsi-Meet frame.
     * @private
     * @returns {void}
     */
    async _executeWithingMeetingFrame(task: () => Promise<void>): Promise<void> {
        const meetingFrameEl = await this.waitForElementDisplayed(MEETING_IFRAME, constants.MEETING_LOAD_WAIT);

        await this._browser.switchToFrame(meetingFrameEl);

        const largeVideoContainerEl = await this._browser.$('#largeVideoContainer');

        await largeVideoContainerEl.waitForDisplayed();

        await task();

        await this._browser.switchToParentFrame();
    }
}

export default MeetingPage;
