import JitsiMeetJS from 'lib-jitsi-meet';

/**
 * Prevent JitsiMeetJS from spamming the console.
 */
JitsiMeetJS.setLogLevel('trace');

const loggers = {
    'modules/RTC/TraceablePeerConnection.js': 'info',
    'modules/statistics/CallStats.js': 'info',
    'modules/xmpp/strophe.util.js': 'log'
};

for (const [ id, level ] of Object.entries(loggers)) {
    JitsiMeetJS.setLogLevelById(level, id);
}

/**
 * A wrapper around the global JitsiMeetJS, as loaded by lib-jitsi-meet.
 */
export default {
    get() {
        return JitsiMeetJS;
    }
};
