const PageObject = require('./page-object');

const INPUT = '.meeting-name-input';
const SUBMIT_BUTTON = '.meeting-name-submit';

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
    async setMeetingName(meetingName) {
        await this.waitForVisible();

        const meetingNameEntry = await this.select(INPUT);

        await meetingNameEntry.setValue(meetingName);
    }

    /**
     * Clicks on the submit button.
     *
     * @returns {void}
     */
    async submit() {
        const submitButton = await this.select(SUBMIT_BUTTON);

        await submitButton.click();
    }

    /**
     * A convenience method for going to the passed-in meeting name.
     *
     * @param {string} meetingName - The name of the meeting to type into the
     * {@code MeetingInput}.
     * @returns {void}
     */
    async submitMeetingName(meetingName) {
        await this.setMeetingName(meetingName);
        await this.submit();
    }
}

module.exports = MeetingInput;
