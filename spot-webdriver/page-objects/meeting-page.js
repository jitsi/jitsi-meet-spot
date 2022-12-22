const { URL } = require('url');

const constants = require('../constants');

const PageObject = require('./page-object');

const AUDIO_MUTED_INDICATOR = '.audio-muted-status';
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
    constructor(driver) {
        super(driver, MEETING_VIEW);
    }

    /**
     * Checks the Jitsi-Meet iFrame for the meeting name it is displaying.
     *
     * @returns {string}
     */
    async getMeetingName() {
        const iframe = await this.select(MEETING_IFRAME);

        const meetingUrl = await iframe.getAttribute('src');

        const urlParts = new URL(meetingUrl);

        return urlParts.pathname.split('/').pop();
    }

    /**
     * Checks whether or not the Jitsi-Meet iFrame is visible.
     *
     * @returns {boolean}
     */
    async isDisplayingMeeting() {
        const meetingIframeEl = await this.select(MEETING_IFRAME);

        return await meetingIframeEl.isDisplayed();
    }

    /**
     * Checks the Jitsi-Meet iFrame for whether or not tile view layout is
     * currently displayed.
     *
     * @returns {boolean}
     */
    async isInTileView() {
        let tileViewDisplayed;

        await this._executeWithingMeetingFrame(async () => {
            const tileViewLayoutEl = await this.select(JITSI_MEET_TILE_VIEW_LAYOUT);

            tileViewDisplayed = await tileViewLayoutEl.isExisting();
        });

        return tileViewDisplayed;
    }

    /**
     * Waits for the audio muted status indicator to be displayed or hidden.
     *
     * @param {boolean} muted - The state in which the audio muted status
     * indicator needs to be in.
     * @returns {void}
     */
    async waitForAudioMutedStateToBe(muted) {
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
    async waitForMeetingJoined() {
        await this.waitForElementDisplayed(MEETING_IFRAME, constants.MEETING_LOAD_WAIT);

        const loadingCurtainEl = await this.select('.loading-curtain');

        await loadingCurtainEl.waitForExist({ timeout: constants.MEETING_LOAD_WAIT, reverse: true});
    }

    /**
     * Waits for the Jitsi-Meet meeting to either show or not show tile view
     * layout.
     *
     * @param {boolean} enabled - Whether it is expected that tile view be
     * displayed or not.
     * @returns {void}
     */
    async waitForTileViewStateToBe(enabled) {
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
     * @param {boolean} muted - The state in which the video muted status
     * indicator needs to be in.
     * @returns {void}
     */
    async waitForVideoMutedStateToBe(muted) {
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
     * @param {Function} task - The actions to perform while in the context of
     * the Jitsi-Meet frame.
     * @private
     * @returns {void}
     */
    async _executeWithingMeetingFrame(task) {
        const meetingFrameEl = await this.waitForElementDisplayed(MEETING_IFRAME, constants.MEETING_LOAD_WAIT);

        await browser[this.driver].switchToFrame(meetingFrameEl);

        const largeVideoContainerEl = await browser[this.driver].$('#largeVideoContainer');

        await largeVideoContainerEl.waitForDisplayed();

        await task();

        await browser[this.driver].switchToParentFrame();
    }
}

module.exports = MeetingPage;
