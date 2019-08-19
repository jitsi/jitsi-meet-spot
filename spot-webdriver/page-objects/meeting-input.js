const PageObject = require('./page-object');

const INPUT = '[data-qa-id=meeting-name-input] input';
const SUBMIT_BUTTON = '[data-qa-id=meeting-name-submit]';

/**
 * A page object for interacting with Spot-Remote's input field for entering a
 * meeting name to join.
 */
class MeetingInput extends PageObject {
    /**
     * Initializes a new {@code MeetingInput} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, INPUT);
    }

    /**
     * Sets the input value.
     *
     * @param {string} meetingName - Text to enter into {@code MeetingInput}.
     * @returns {void}
     */
    setMeetingName(meetingName) {
        this.waitForVisible();

        const meetingNameEntry = this.select(INPUT);

        meetingNameEntry.setValue(meetingName);
    }

    /**
     * Clicks on the submit button.
     *
     * @returns {void}
     */
    submit() {
        const submitButton = this.select(SUBMIT_BUTTON);

        submitButton.click(SUBMIT_BUTTON);
    }

    /**
     * A convenience method for going to the passed-in meeting name.
     *
     * @param {string} meetingName - The name of the meeting to type into the
     * {@code MeetingInput}.
     * @returns {void}
     */
    submitMeetingName(meetingName) {
        this.setMeetingName(meetingName);
        this.submit();
    }
}

module.exports = MeetingInput;
