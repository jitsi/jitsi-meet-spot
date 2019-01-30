const MeetingInput = require('./meeting-input');
const PageObject = require('./page-object');

const REMOTE_CONTROL = '[data-qa-id=remoteControl-view]';

/**
 * A page object for interacting with the remote control view of Spot.
 */
class RemoteControlPage extends PageObject {
    /**
     * Initializes a new {@code RemoteControlPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.meetingInput = new MeetingInput(this.driver);
        this.rootSelector = REMOTE_CONTROL;
    }

    /**
     * Returns an instance of the page object {@code MeetingInput}.
     *
     * @returns {MeetingInput}
     */
    getMeetingInput() {
        return this.meetingInput;
    }
}

module.exports = RemoteControlPage;
