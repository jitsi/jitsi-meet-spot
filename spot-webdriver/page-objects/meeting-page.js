const { URL } = require('url');

const PageObject = require('./page-object');

const MEETING_IFRAME = '#jitsiConferenceFrame0';
const MEETING_VIEW = '[data-qa-id=meeting-view]';

/**
 * A page object for interacting with the in-meeting view of Spot.
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
        const meetingUrl = this.driver.getAttribute(
            MEETING_IFRAME,
            'src');
        const urlParts = new URL(meetingUrl);

        return urlParts.pathname.split('/').pop();
    }
}

module.exports = MeetingPage;
