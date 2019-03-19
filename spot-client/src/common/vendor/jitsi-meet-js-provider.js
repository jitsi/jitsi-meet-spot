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
    },

    /**
     * Returns whether or not the current environment supports wirelessly screensharing into a Spot.
     * Currently only Chrome works and the underlying implementation assumes getDisplayMedia is
     * available.
     *
     * @private
     * @returns {boolean}
     */
    isWirelessScreenshareSupported() {
        const JitsiMeetJS = this.get();

        return (JitsiMeetJS.util.browser.isChrome()
            && JitsiMeetJS.util.browser.supportsGetDisplayMedia())
            || JitsiMeetJS.util.browser.isElectron();
    }
};
