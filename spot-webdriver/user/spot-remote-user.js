const InMeetingPage = require('../page-objects/spot-remote-in-meeting-page');
const JoinCodePage = require('../page-objects/join-code-page');
const RemoteControlPage = require('../page-objects/remote-control-page');

/**
 * A model wrapping a browser driver representing a Spot Remote which acts as the remote
 * controller of a Spot TV.
 */
class SpotRemote {
    /**
     * Initializes a new {@code User} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        this.driver = driver;

        this.inMeetingPage = new InMeetingPage(this.driver);
        this.joinCodePage = new JoinCodePage(this.driver);
        this.remoteControlPage = new RemoteControlPage(this.driver);
    }

    /**
     * Returns an instance of {@code InMeetingPage} which wraps interactions with the Spot-Remote
     * view when connected to a Spot-TV in a meeting.
     *
     * @returns {InMeetingPage}
     */
    getInMeetingPage() {
        return this.inMeetingPage;
    }

    /**
     * Returns an instance of {@code JoinCodePage} which wraps interactions with the join code view
     * in the remote control.
     *
     * @returns {JoinCodePage}
     */
    getJoinCodePage() {
        return this.joinCodePage;
    }

    /**
     * Returns an instance of {@code RemoteControlPage} which wraps interactions with the remote
     * control view in Spot.
     *
     * @returns {RemoteControlPage}
     */
    getRemoteControlPage() {
        return this.remoteControlPage;
    }
}

module.exports = SpotRemote;
