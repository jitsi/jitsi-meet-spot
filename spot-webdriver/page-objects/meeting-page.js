const { URL } = require('url');

const constants = require('../constants');

const PageObject = require('./page-object');

const AUDIO_MUTED_INDICATOR = '[data-qa-id=audio-muted-status]';
const MEETING_IFRAME = '#jitsiConferenceFrame0';
const MEETING_VIEW = '[data-qa-id=meeting-view]';
const VIDEO_MUTED_INDICATOR = '[data-qa-id=video-muted-status]';

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
        super(driver);

        this.rootSelector = MEETING_VIEW;
    }

    /**
     * Checks the Jitsi-Meet iFrame for the meeting name it is displaying.
     *
     * @returns {string}
     */
    getMeetingName() {
        const iframe = this.select(MEETING_IFRAME);
        const meetingUrl = iframe.getAttribute('src');
        const urlParts = new URL(meetingUrl);

        return urlParts.pathname.split('/').pop();
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
}

module.exports = MeetingPage;
