import type { BrowserName } from '../constants/index.js';

import PageObject from './page-object.js';

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
    constructor(driver: BrowserName) {
        super(driver, INPUT);
    }

    /**
     * Sets the input value.
     *
     * @param meetingName - Text to enter into {@code MeetingInput}.
     * @returns {void}
     */
    async setMeetingName(meetingName: string): Promise<void> {
        await this.waitForVisible();

        const meetingNameEntry = await this.select(INPUT);

        await meetingNameEntry.setValue(meetingName);
    }

    /**
     * Clicks on the submit button.
     *
     * @returns {void}
     */
    async submit(): Promise<void> {
        const submitButton = await this.select(SUBMIT_BUTTON);

        await submitButton.click();
    }

    /**
     * A convenience method for going to the passed-in meeting name.
     *
     * @param meetingName - The name of the meeting to type into the
     * {@code MeetingInput}.
     * @returns {void}
     */
    async submitMeetingName(meetingName = ''): Promise<void> {
        await this.setMeetingName(meetingName);
        await this.submit();
    }
}

export default MeetingInput;
