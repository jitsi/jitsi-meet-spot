declare const JitsiMeetJS: any;

/**
 * A flag to track whether the JitsiMeetJS library has been initialized.
 */
let _initialized = false;

/**
 * A wrapper around the global JitsiMeetJS, as loaded by lib-jitsi-meet.
 */
export default {
    get(): any {
        if (!_initialized) {
            // Prevent JitsiMeetJS from spamming the console.
            JitsiMeetJS.setLogLevel('trace');

            const loggers: { [id: string]: string; } = {
                'modules/RTC/TraceablePeerConnection': 'info',
                'modules/xmpp/strophe.util': 'log'
            };

            for (const [ id, level ] of Object.entries(loggers)) {
                JitsiMeetJS.setLogLevelById(level, id);
            }

            JitsiMeetJS.init({});

            _initialized = true;
        }

        return (window as any).JitsiMeetJS;
    }
};
