// lib-jitsi-meet assumes jQuery is available globally.
const jQuery = require('jquery');

window.$ = jQuery;

import JitsiMeetJS from 'lib-jitsi-meet/lib-jitsi-meet.min';

/**
 * Prevent JitsiMeetJS from spamming the console.
 */
JitsiMeetJS.setLogLevel('error');

/**
 * A wrapper around the global JitsiMeetJS, as loaded by lib-jitsi-meet.
 */
export default {
    get() {
        return JitsiMeetJS;
    }
};
