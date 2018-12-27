const PageObject = require('./page-object');

const INPUT = '[data-qa-id=meeting-name-input]';
const SUBMIT_BUTTON = '[data-qa-id=meeting-name-submit]';

/**
 * A page object for interacting with the input field for entering a meeting
 * name to join.
 */
class MeetingInput extends PageObject {
    /**
     * Initializes a new {@code MeetingInput} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.rootSelector = INPUT;
    }

    /**
     * Sets the input value.
     *
     * @param {string} meetingName - The text to enter into
     * {@code MeetingInput}.
     * @returns {void}
     */
    setMeetingName(meetingName) {
        this.waitForVisible();
        this.driver.setValue(INPUT, meetingName);
    }

    /**
     * Clicks on the submit button.
     *
     * @returns {void}
     */
    submit() {
        this.driver.click(SUBMIT_BUTTON);
    }

    /**
     * A convenience method for going to the passed-in meeting name.
     *
     * @param {string} meetingName
     * @returns {void}
     */
    submitMeetingName(meetingName) {
        this.setMeetingName(meetingName);
        this.submit();
    }
}

module.exports = MeetingInput;
