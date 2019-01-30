/* global JitsiMeetJS */

/**
 * A wrapper around the global JitsiMeetJS, as loaded by lib-jitsi-meet.
 */
export default {
    get() {
        if (this._jitsiMeetJS) {
            return this._jitsiMeetJS;
        }

        JitsiMeetJS.init({});
        JitsiMeetJS.setLogLevel('error');

        this._jitsiMeetJS = window.JitsiMeetJS;

        return this._jitsiMeetJS;
    }
};
