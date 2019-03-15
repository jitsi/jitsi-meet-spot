const constants = require('../constants');

const SpotSession = require('../user/spot-session');

describe('A Spot-Remote can screenshare wirelessly', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();
    const spotSession = new SpotSession(spotTV, spotRemote);

    /**
     * Goes through the flow for starting a wireless screenshare session
     * starting from the Spot-Remote Waiting-For-Call view.
     *
     * @param {boolean} isPickerExpected - Whether or not a screenshare picker
     * will display when starting wireless screensharing.
     * @private
     * @returns {void}
     */
    function startScreenshareFromHome(isPickerExpected) {
        const remoteControlPage = spotRemote.getRemoteControlPage();

        remoteControlPage.waitForVisible();

        if (isPickerExpected) {
            remoteControlPage.startWirelessScreenshareWithPicker();
        } else {
            remoteControlPage.startWirelessScreenshareWithoutPicker();
        }

        const meetingPage = spotTV.getMeetingPage();

        meetingPage.waitForVisible();
        meetingPage.waitForMeetingJoined();

        const inMeetingPage = spotRemote.getInMeetingPage();

        inMeetingPage.waitForScreensharingStateToBe(true);
        inMeetingPage.stopScreensharing();
        inMeetingPage.waitForScreensharingStateToBe(false);
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
    function startScreenshareFromMeeting(isPickerExpected) {
        const remoteControlPage = spotRemote.getRemoteControlPage();
        const meetingInput = remoteControlPage.getMeetingInput();

        meetingInput.submitMeetingName();

        const meetingPage = spotTV.getMeetingPage();

        meetingPage.waitForVisible();

        const inMeetingPage = spotRemote.getInMeetingPage();

        if (isPickerExpected) {
            inMeetingPage.startWirelessScreenshareWithPicker();
        } else {
            inMeetingPage.startWirelessScreenshareWithoutPicker();
        }

        inMeetingPage.waitForScreensharingStateToBe(true);
    }

    beforeEach(() => {
        spotSession.connectRemoteToTV();
    });

    describe('with no wired screenshare setup', () => {
        it('from the waiting screen', () => {
            startScreenshareFromHome(false);
        });

        it('from in a call', () => {
            startScreenshareFromMeeting(false);
        });
    });

    describe('with wired screenshare set up', () => {
        beforeEach(() => {
            // Ensure wired screensharing is set up.
            const calendarPage = spotTV.getCalendarPage();

            calendarPage.goToAdminPage();

            const adminPage = spotTV.getAdminPage();

            adminPage.setScreenshareInput(constants.FAKE_SCREENSHARE_FILE_NAME);
            adminPage.exit();
        });

        it('from the waiting screen', () => {
            startScreenshareFromHome(true);
        });

        it('from in a call', () => {
            startScreenshareFromMeeting(true);
        });
    });
});
