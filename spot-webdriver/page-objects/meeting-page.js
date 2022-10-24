const { URL } = require('url');

const constants = require('../constants');

const PageObject = require('./page-object');

const AUDIO_MUTED_INDICATOR = '[data-qa-id=audio-muted-status]';
const MEETING_IFRAME = '#jitsiConferenceFrame0';
const MEETING_VIEW = '[data-qa-id=meeting-view]';
const VIDEO_MUTED_INDICATOR = '[data-qa-id=video-muted-status]';

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
    isDisplayingMeeting() {
        return this.select(MEETING_IFRAME).isDisplayed();
    }

    /**
     * Checks the Jitsi-Meet iFrame for whether or not tile view layout is
     * currently displayed.
     *
     * @returns {boolean}
     */
    isInTileView() {
        let tileViewDisplayed;

        this._executeWithingMeetingFrame(() => {
            tileViewDisplayed
                = this.select(JITSI_MEET_TILE_VIEW_LAYOUT).isExisting();
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
    waitForAudioMutedStateToBe(muted) {
        if (muted) {
            this.waitForElementDisplayed(AUDIO_MUTED_INDICATOR);
        } else {
            this.waitForElementHidden(AUDIO_MUTED_INDICATOR);
        }
    }

    /**
     * Waits for the Jitsi-Meet meeting to be displayed.
     *
     * @returns {void}
     */
    waitForMeetingJoined() {
        this.waitForElementDisplayed(MEETING_IFRAME, constants.MEETING_LOAD_WAIT);

        this.select('.loading-curtain')
            .waitForExist(constants.MEETING_LOAD_WAIT, true);
    }

    /**
     * Waits for the Jitsi-Meet meeting to either show or not show tile view
     * layout.
     *
     * @param {boolean} enabled - Whether it is expected that tile view be
     * displayed or not.
     * @returns {void}
     */
    waitForTileViewStateToBe(enabled) {
        this._executeWithingMeetingFrame(() => {
            if (enabled) {
                this.waitForElementDisplayed(JITSI_MEET_TILE_VIEW_LAYOUT);
            } else {
                this.select(JITSI_MEET_TILE_VIEW_LAYOUT)
                    .waitForExist(undefined, true);
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
    waitForVideoMutedStateToBe(muted) {
        if (muted) {
            this.waitForElementDisplayed(VIDEO_MUTED_INDICATOR);
        } else {
            this.waitForElementHidden(VIDEO_MUTED_INDICATOR);
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
    _executeWithingMeetingFrame(task) {
        this.waitForElementDisplayed(MEETING_IFRAME, constants.MEETING_LOAD_WAIT);

        this.driver.switchToFrame(this.select(MEETING_IFRAME));

        this.select('#largeVideoContainer').waitForDisplayed();

        task();

        this.driver.switchToParentFrame();
    }
}

module.exports = MeetingPage;
