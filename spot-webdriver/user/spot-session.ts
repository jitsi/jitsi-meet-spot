import { randomUUID } from 'node:crypto';

import * as constants from './../constants/index.js';

import type SpotRemote from './spot-remote-user.js';
import type SpotTV from './spot-tv-user.js';

const QUERY_PARAM_TEST_BACKEND_REFRESH_TOKEN = 'testBackendRefreshToken';

/**
 * Represents a session/connection between SpotTV and SpotRemote instances.
 */
class SpotSession {
    spotTV: SpotTV;
    spotRemote: SpotRemote;

    /**
     * Initializes new {@code SpotSession} between TV and remote (there's no connection between
     * the two yet).
     *
     * @param spotTV - The Spot TV instance that will be part of this session.
     * @param spotRemote - The Spot Remote instance that will be part of this session.
     */
    constructor(spotTV: SpotTV, spotRemote: SpotRemote) {
        this.spotTV = spotTV;
        this.spotRemote = spotRemote;
    }

    /**
     * Obtains the join code from the {@code SpotTV} and makes the {@code SpotRemote} connect to
     * the TV using the code.
     *
     * @returns {void}
     */
    async connectRemoteToTV(): Promise<void> {
        await this._submitJoinCode();

        const remoteControlPage = this.spotRemote.getRemoteControlPage();

        await remoteControlPage.waitForVisible();

        await this.spotRemote.waitForP2PConnectionEstablished();
    }

    /**
     * Obtains the join code from the {@code SpotTV} and makes the {@code SpotRemote} connect to
     * the TV using the code, but also starts connected in share mode.
     *
     * @returns {void}
     */
    async connectScreeshareOnlyRemoteToTV(): Promise<void> {
        const queryParams: Map<string, unknown> = new Map();

        queryParams.set('share', true);

        await this._submitJoinCode({ queryParams });
    }

    /**
     * Returns the Spot-TV associated with the session.
     *
     * @returns {SpotTV}
     */
    getSpotTV(): SpotTV {
        return this.spotTV;
    }

    /**
     * Returns the Spot-Remove associated with the session.
     *
     * @returns {SpotRemote}
     */
    getSpotRemote(): SpotRemote {
        return this.spotRemote;
    }

    /**
     * Checks if backend is enabled in the current test session.
     *
     * @returns {boolean}
     */
    static isBackendEnabled(): boolean {
        return Boolean(constants.BACKEND_REFRESH_TOKEN);
    }

    /**
     * The {@code SpotRemote} makes the TV join a meeting with the given name. If a name is not
     * provided the session selects a random one.
     *
     * @param meetingName - The name of the meeting to join (optional).
     * @param options - Additional ways to perform the join meeting.
     * @returns {string} - The name of the meeting that the Spot TV tried to join.
     */
    async joinMeeting(meetingName?: string, options: { skipJoinVerification?: boolean; } = {}): Promise<string> {
        const remoteControlPage = this.spotRemote.getRemoteControlPage();

        await remoteControlPage.waitForVisible();

        const testMeetingName = meetingName ? meetingName : `ui-test-${randomUUID()}`;
        const meetingInput = await remoteControlPage.getMeetingInput();

        await meetingInput.submitMeetingName(testMeetingName);

        const meetingPage = this.spotTV.getMeetingPage();

        if (options.skipJoinVerification) {
            await meetingPage.waitForVisible();
        }

        return testMeetingName;
    }

    /**
     * Cleanups all sessions.
     *
     * @returns {void}
     */
    cleanup(): void {
        this.spotRemote.cleanup();
        this.spotTV.cleanup();
    }

    /**
     * Starts Spot Remote with given join code and extra query params.
     *
     * @param joinCode - The join code to be entered on the join code page.
     * @param queryParams - Any extra query params to be added to the Spot Remote URL.
     * @returns {void}
     */
    async startSpotRemote(joinCode: string, queryParams?: Map<string, unknown>): Promise<void> {
        const joinCodePage = this.spotRemote.getJoinCodePage();

        await joinCodePage.visit(queryParams);
        await joinCodePage.enterCode(joinCode);
    }

    /**
     * Connects Spot Remote using permanent pairing code.
     *
     * @returns {void}
     */
    async startPermanentSpotRemote(): Promise<void> {
        const queryParams: Map<string, unknown> = new Map();

        queryParams.set(QUERY_PARAM_TEST_BACKEND_REFRESH_TOKEN, constants.BACKEND_REFRESH_TOKEN || '');

        await this.spotRemote.getJoinCodePage().visit(queryParams, /* do not wait for join code page */ -1);

        // The join code page once feed with the pairing code will redirect to remote-control.
        // It can't go directly to the remote control page, because the join code page starts the connection.
        await this.spotRemote.getRemoteControlPage().waitForVisible();

        await this.spotRemote.waitForP2PConnectionEstablished();
    }

    /**
     * Starts the Spot TV and opens the home page(calendar page).
     *
     * @param skipWaitForVisible - If set to {@code true} will not wait for the home page to be displayed.
     * @returns {void}
     */
    async startSpotTv(skipWaitForVisible?: boolean): Promise<void> {
        const calendarPage = this.spotTV.getCalendarPage();
        const queryParams: Map<string, unknown> = new Map();

        queryParams.set(QUERY_PARAM_TEST_BACKEND_REFRESH_TOKEN, constants.BACKEND_REFRESH_TOKEN || '');

        await calendarPage.visit(queryParams, skipWaitForVisible ? -1 : constants.MAX_PAGE_LOAD_WAIT);
    }

    /**
     * Orchestrates the interactions for obtaining the join code from the {@code SpotTV}
     * and submitting it on the join code page of the {@code SpotRemote}.
     *
     * @param options - Additional configuration to use when initializing the connection
     * between the SpotTV and SpotRemote.
     * @private
     * @returns {void}
     */
    async _submitJoinCode(options: { queryParams?: Map<string, unknown>; } = {}): Promise<void> {
        await this.startSpotTv();

        const joinCode = await this.spotTV.getShortLivedPairingCode();

        await this.startSpotRemote(joinCode, options.queryParams);
    }
}

export default SpotSession;
