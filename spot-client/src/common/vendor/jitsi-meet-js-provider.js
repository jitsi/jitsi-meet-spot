/* global JitsiMeetJS */

/**
 * Prevent JitsiMeetJS from spamming the console.
 */
JitsiMeetJS.setLogLevel('error');

/**
 * A wrapper around the global JitsiMeetJS, as loaded by lib-jitsi-meet.
 */
export default {
    get() {
        return window.JitsiMeetJS;
    }
};
