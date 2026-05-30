const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://127.0.0.1:8000';

/**
 * The refresh token to use when testing using the backend integration so the Spot-TV can connect to the backend.
 */
export const BACKEND_REFRESH_TOKEN = process.env.BACKEND_REFRESH_TOKEN;

/**
 * The name of the video file which should be used by Chrome as the video
 * to display while using a fake camera. A file with a static image is used
 * so the fake camera source can be used as a screenshare dongle source
 * without triggering Spot-TV's camera input change detection which would
 * automatically start a meeting.
 */
export const FAKE_SCREENSHARE_FILE_NAME = 'static-image.y4m';

/**
 * Direct URL to visible to see instructions on how to use Spot.
 */
export const HELP_PAGE_URL = `${TEST_SERVER_URL}/help`;

/**
 * The direct URL to visit to start the flow for becoming a Spot-Remote for a Spot-TV.
 */
export const JOIN_CODE_ENTRY_URL = TEST_SERVER_URL;

/**
 * The maximum amount of time, in milliseconds, to allow a page to load.
 */
export const MAX_PAGE_LOAD_WAIT = 120000;

/**
 * The maximum amount of time, in milliseconds, to allow Jitsi-Meet to load and join a meeting.
 */
export const MEETING_JOIN_WAIT = 15000;

/**
 * The maximum amount of time, in milliseconds, to allow Jitsi-Meet to load.
 */
export const MEETING_LOAD_WAIT = 20000;

/**
 * The amount of time to wait for a Spot-Remote and Spot-TV to create a peer-to-peer connection.
 */
export const P2P_ESTABLISHED_WAIT = 10000;

/**
 * The maximum amount of time, in milliseconds, for a Spot-Remote to wait for the Spot-TV to update
 * its state after a command is sent.
 */
export const REMOTE_COMMAND_WAIT = 10000;

/**
 * Name of capability for the multiremote WDIO testrunner of the remote control browser.
 */
export const REMOTE_CONTROL_BROWSER = 'remoteControlBrowser';

/**
 * The max amount to wait for the signaling connection (XMPP) to go to a disconnected state.
 */
export const SIGNALING_DISCONNECT_TIMEOUT = 60000;

/**
 * Name of capability for the multiremote WDIO testrunner of the spot browser.
 */
export const SPOT_BROWSER = 'spotBrowser';

/**
 * The direct URL to visit to for a browser to act as a Spot-TV.
 */
export const SPOT_URL = `${TEST_SERVER_URL}/tv`;

/**
 * The capability names of the two browsers in the multiremote session.
 */
export type BrowserName = typeof REMOTE_CONTROL_BROWSER | typeof SPOT_BROWSER;
