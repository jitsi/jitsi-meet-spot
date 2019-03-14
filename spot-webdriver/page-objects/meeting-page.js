const { URL } = require('url');

const constants = require('../constants');

const PageObject = require('./page-object');

const MEETING_IFRAME = '#jitsiConferenceFrame0';
const MEETING_VIEW = '[data-qa-id=meeting-view]';

/**
 * A page object for interacting with the in-meeting view of Spot TV.
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
     * Checks the jitsi iFrame for the meeting name it is displaying.
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
     * Waits for the jitsi meeting to be displayed.
     *
     * @returns {void}
     */
    waitForMeetingJoined() {
        this.waitForElementDisplayed(MEETING_IFRAME, constants.MEETING_LOAD_WAIT);

        this.select('.loading-curtain')
            .waitForExist(constants.MEETING_LOAD_WAIT, true);
    }
}

module.exports = MeetingPage;
