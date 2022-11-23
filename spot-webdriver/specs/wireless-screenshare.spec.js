const constants = require('../constants');

const spotSessionStore = require('../user/spotSessionStore');

describe('A Spot-Remote can screenshare wirelessly', () => {
    const session = spotSessionStore.createSession();
    const spotTV = session.getSpotTV();
    const spotRemote = session.getSpotRemote();

    /**
     * Goes through the flow for starting a wireless screenshare session
     * starting from the Spot-Remote Waiting-For-Call view.
     *
     * @param {boolean} isPickerExpected - Whether or not a screenshare picker
     * will display when starting wireless screensharing.
     * @private
     * @returns {void}
     */
    async function startScreenshareFromHome(isPickerExpected) {
        const remoteControlPage = spotRemote.getRemoteControlPage();

        await remoteControlPage.waitForVisible();

        if (isPickerExpected) {
            await remoteControlPage.startWirelessScreenshareWithPicker();
        } else {
            await remoteControlPage.startWirelessScreenshareWithoutPicker();
        }

        const meetingPage = spotTV.getMeetingPage();

        await meetingPage.waitForVisible();
        await meetingPage.waitForMeetingJoined();

        const inMeetingPage = spotRemote.getInMeetingPage();

        await inMeetingPage.waitForScreensharingStateToBe(true);
        await inMeetingPage.stopScreensharing();
        await inMeetingPage.waitForScreensharingStateToBe(false);
    }

    /**
     * Goes through the flow for starting a wireless screenshare session
     * starting from the Spot-Remote in the call view.
     *
     * @param {boolean} isPickerExpected - Whether or not a screenshare picker
     * will display when starting wireless screensharing.
     * @private
     * @returns {void}
     */
    async function startScreenshareFromMeeting(isPickerExpected) {
        const remoteControlPage = spotRemote.getRemoteControlPage();
        const meetingInput = await remoteControlPage.getMeetingInput();

        await meetingInput.submitMeetingName();

        const meetingPage = spotTV.getMeetingPage();

        await meetingPage.waitForVisible();
        await meetingPage.waitForMeetingJoined();

        const inMeetingPage = spotRemote.getInMeetingPage();

        if (isPickerExpected) {
            await inMeetingPage.startWirelessScreenshareWithPicker();
        } else {
            await inMeetingPage.startWirelessScreenshareWithoutPicker();
        }

        await inMeetingPage.waitForScreensharingStateToBe(true);
    }

    beforeEach(async () => {
        await session.connectRemoteToTV();
    });

    describe('with no wired screenshare setup', () => {
        it('from the waiting screen', async () => {
            await startScreenshareFromHome(false);
        });

        it('from in a call', async () => {
            await startScreenshareFromMeeting(false);
        });
    });

    describe('with wired screenshare set up', () => {
        beforeEach(async () => {
            // Ensure wired screensharing is set up.
            const calendarPage = spotTV.getCalendarPage();

            await calendarPage.goToAdminPage();

            const adminPage = spotTV.getAdminPage();

            await adminPage.setScreenshareInput(constants.FAKE_SCREENSHARE_FILE_NAME);
            await adminPage.exit();
        });

        it('from the waiting screen', async () => {
            await startScreenshareFromHome(true);
        });

        it('from in a call', async () => {
            await startScreenshareFromMeeting(true);
        });
    });
});
