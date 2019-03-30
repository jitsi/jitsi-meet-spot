const InMeetingPage = require('../page-objects/spot-remote-in-meeting-page');
const JoinCodePage = require('../page-objects/join-code-page');
const ModeSelectPage = require('../page-objects/mode-select-page');
const RemoteControlPage = require('../page-objects/remote-control-page');
const StopSharePage = require('../page-objects/stop-share-page');

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
        this.modeSelectPage = new ModeSelectPage(this.driver);
        this.remoteControlPage = new RemoteControlPage(this.driver);
        this.stopSharePage = new StopSharePage(this.driver);
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
     * Returns an instance of {@code ModeSelectPage} which wraps interactions with starting
     * wireless screensharing or exiting share mode.
     *
     * @returns {ModeSelectPage}
     */
    getModeSelectPage() {
        return this.modeSelectPage;
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

    /**
     * Returns an instance of {@code StopSharePage} which wraps interactions with stop sharing
     * view in the remote control.
     *
     * @returns {StopSharePage}
     */
    getStopSharePage() {
        return this.stopSharePage;
    }
}

module.exports = SpotRemote;
