import type { BrowserName } from '../constants/index.js';
import InMeetingPage from '../page-objects/spot-remote-in-meeting-page.js';
import JoinCodePage from '../page-objects/join-code-page.js';
import ModeSelectPage from '../page-objects/mode-select-page.js';
import RemoteControlPage from '../page-objects/remote-control-page.js';
import StopSharePage from '../page-objects/stop-share-page.js';

import SpotUser from './spot-user.js';

/**
 * A model wrapping a browser driver representing a Spot-Remote which acts as the remote
 * controller of a Spot-TV.
 */
class SpotRemote extends SpotUser {
    inMeetingPage: InMeetingPage;
    joinCodePage: JoinCodePage;
    modeSelectPage: ModeSelectPage;
    remoteControlPage: RemoteControlPage;
    stopSharePage: StopSharePage;

    /**
     * Initializes a new {@code SpotRemote} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, 'remoteControlClient');

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
    getInMeetingPage(): InMeetingPage {
        return this.inMeetingPage;
    }

    /**
     * Returns an instance of {@code JoinCodePage} which wraps interactions with the join code view
     * in the Spot-Remote.
     *
     * @returns {JoinCodePage}
     */
    getJoinCodePage(): JoinCodePage {
        return this.joinCodePage;
    }

    /**
     * Returns an instance of {@code ModeSelectPage} which wraps interactions with starting
     * wireless screensharing or exiting share mode.
     *
     * @returns {ModeSelectPage}
     */
    getModeSelectPage(): ModeSelectPage {
        return this.modeSelectPage;
    }

    /**
     * Returns an instance of {@code RemoteControlPage} which wraps interactions with the remote
     * control view in Spot-Remote.
     *
     * @returns {RemoteControlPage}
     */
    getRemoteControlPage(): RemoteControlPage {
        return this.remoteControlPage;
    }

    /**
     * Returns an instance of {@code StopSharePage} which wraps interactions with stop sharing
     * view in Spot-Remote.
     *
     * @returns {StopSharePage}
     */
    getStopSharePage(): StopSharePage {
        return this.stopSharePage;
    }
}

export default SpotRemote;
